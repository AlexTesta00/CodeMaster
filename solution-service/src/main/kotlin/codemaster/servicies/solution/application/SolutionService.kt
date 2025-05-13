package codemaster.servicies.solution.application

import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.withContext
import org.bson.types.ObjectId
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.ExecutionException
import java.util.concurrent.TimeUnit

@Service
class SolutionService(
    private val repository: SolutionRepository,
    @Value("\${solution.runner.path:build/tmp/code-run}") private val injectedRunnerPath: String
) {

    companion object {
        const val TIMEOUT: Long = 20_000
    }

    suspend fun addSolution(
        id: SolutionId,
        user: String,
        questId: ObjectId,
        language: Language,
        code: String,
        testCode: String
    ): Solution? {
        val newSolution = SolutionFactoryImpl().create(id, user, questId, language, code, testCode)
        return repository.addNewSolution(newSolution).awaitSingle()
    }

    suspend fun modifySolutionCode(id: SolutionId, code: String): Solution? {
        return repository.updateCode(id, code).awaitSingle()
    }

    suspend fun modifySolutionLanguage(id: SolutionId, language: Language): Solution? {
        return repository.updateLanguage(id, language).awaitSingle()
    }

    suspend fun modifySolutionTestCode(id: SolutionId, testCode: String): Solution? {
        return repository.updateTestCode(id, testCode).awaitSingle()
    }

    suspend fun getSolution(id: SolutionId): Solution? {
        return repository.findSolutionById(id).awaitSingle()
    }

    suspend fun getSolutionsByQuestId(questId: ObjectId): List<Solution>? {
        return repository.findSolutionsByQuestId(questId).collectList().awaitSingle()
    }

    suspend fun getSolutionsByLanguage(language: Language): List<Solution>? {
        return repository.findSolutionsByLanguage(language).collectList().awaitSingle()
    }

    suspend fun deleteSolution(id: SolutionId): Solution? {
        return repository.removeSolutionById(id).awaitSingle()
    }

    suspend fun executeSolution(id: SolutionId): Solution? {
        val solution = repository.findSolutionById(id).awaitSingle()
        val codeDir = resolveRunnerPath()
        val sourceFile = codeDir.resolve("Main${solution.language.fileExtension}")

        withContext(Dispatchers.IO) {
            Files.createDirectories(codeDir)
            Files.writeString(sourceFile, generateCode(solution.code, solution.testCode, solution.language))
        }

        val command = getCommandForLanguage(solution.language)
        val result = getResult(codeDir, command)
        return repository.updateResult(id, result).awaitSingle()
    }

    private fun toDockerPath(path: Path): String {
        val fullPath = path.toAbsolutePath().toString()
        return if (System.getProperty("os.name").lowercase().contains("win")) {
            fullPath
                .replace("\\", "/")
                .let {
                    Regex("^([A-Za-z]):").replace(it) { match ->
                        "/${match.groupValues[1].lowercase()}"
                    }
                }
        } else {
            fullPath
        }
    }

    private fun getCommandForLanguage(language: Language): String = when (language.name) {
        "Java" -> "cd /code && javac Main.java && java Main"
        "Scala" -> "cd /code && scalac Main.scala && scala Main"
        "Javascript" -> "cd /code && node Main.js"
        else -> throw IllegalArgumentException("Unsupported language: $language")
    }

    private suspend fun getResult(codeDir: Path, command: String): ExecutionResult {
        lateinit var result: ExecutionResult
        try {
            val process = withContext(Dispatchers.IO) {
                ProcessBuilder(
                    "docker", "run", "--rm",
                    "-v", "${toDockerPath(codeDir)}:/code",
                    "multi-lang-runner",
                    "bash", "-c", command
                ).redirectErrorStream(false)
                    .start()
            }

            val finished = withContext(Dispatchers.IO) {
                process.waitFor(TIMEOUT, TimeUnit.MILLISECONDS)
            }
            if (!finished) {
                process.destroyForcibly()
                return ExecutionResult.TimeLimitExceeded(TIMEOUT)
            }

            val stdout = process.inputStream.bufferedReader().readText().trim()
            val stderr = process.errorStream.bufferedReader().readText().trim()
            val exitCode = process.exitValue()

            result = if (exitCode == 0) {
                ExecutionResult.Accepted(output = stdout, exitCode = 0)
            } else {
                ExecutionResult.Failed(
                    error = "Non-zero exit code",
                    stderr = stderr.ifBlank { "No error output" },
                    exitCode = exitCode
                )
            }
        } catch (e: ExecutionException) {
            result = ExecutionResult.Failed(
                error = e.message ?: "Unexpected execution error",
                stderr = "",
                exitCode = -1
            )
        }
        return result
    }

    private fun resolveRunnerPath(): Path {
        val envPath = System.getenv("SOLUTION_RUNNER_PATH")?.takeIf { it.isNotBlank() }
        val runnerPath = envPath ?: injectedRunnerPath.takeIf { it.isNotBlank() }
        ?: Paths.get(System.getProperty("user.dir"), "build", "tmp", "code-run").toString()
        return Paths.get(runnerPath).toAbsolutePath().normalize()
    }

    private fun generateCode(code: String, testCode: String, language: Language): String {
        val main = Files.readString(Paths.get(System.getProperty("user.dir"),"templates", language.name+"MainTemplate"))
            .replace("// TEST_CODE_HERE", testCode)
        return main.replace("// USER_CODE_HERE", code)
    }
}
