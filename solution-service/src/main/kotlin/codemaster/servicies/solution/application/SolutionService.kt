package codemaster.servicies.solution.application

import codemaster.servicies.solution.application.errors.EmptyCodeException
import codemaster.servicies.solution.application.errors.EmptyLanguageException
import codemaster.servicies.solution.application.errors.EmptyTestCodeException
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.withContext
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
        questId: String,
        language: Language,
        code: String,
        testCode: String
    ): Solution {
        val newSolution = SolutionFactoryImpl().create(id, user, questId, language, code, testCode)
        val solution = repository.addNewSolution(newSolution).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("Error while inserting new solution")
    }

    suspend fun getSolution(id: SolutionId): Solution {
        val solution = repository.findSolutionById(id).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun getSolutionsByQuestId(questId: String): List<Solution> {
        val solution = repository.findSolutionsByQuestId(questId).collectList().awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun getSolutionsByLanguage(language: Language): List<Solution> {
        if (language.name.isBlank() || language.fileExtension.isBlank()) {
            throw EmptyLanguageException()
        }
        val solution = repository.findSolutionsByLanguage(language).collectList().awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun modifySolutionCode(id: SolutionId, code: String): Solution {
        if (code.isBlank()) {
            throw EmptyCodeException()
        }
        val solution = repository.updateCode(id, code).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun modifySolutionLanguage(id: SolutionId, language: Language): Solution {
        if (language.name.isBlank() || language.fileExtension.isBlank()) {
            throw EmptyLanguageException()
        }
        val solution = repository.updateLanguage(id, language).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun modifySolutionTestCode(id: SolutionId, testCode: String): Solution {
        if (testCode.isBlank()) {
            throw EmptyTestCodeException()
        }
        val solution = repository.updateTestCode(id, testCode).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun deleteSolution(id: SolutionId): Solution {
        val solution = repository.removeSolutionById(id).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun executeSolution(id: SolutionId): Solution {
        val solution = repository
            .findSolutionById(id)
            .awaitSingleOrNull() ?: throw NoSuchElementException("No solution found in DB")
        val codeDir = resolveRunnerPath()
        val sourceFile = codeDir.resolve("Main${solution.language.fileExtension}")

        withContext(Dispatchers.IO) {
            Files.createDirectories(codeDir)
            Files.writeString(sourceFile, generateCode(solution.code, solution.testCode, solution.language))
        }

        val command = getCommandForLanguage(solution.language)
        val result = getResult(codeDir, command, solution.id)
        val updatedSolution = repository.updateResult(id, result).awaitSingleOrNull()
        return updatedSolution ?: throw NoSuchElementException("No solution to update found in DB")
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
        "Kotlin" -> "cd /code && kotlinc Main.kt -include-runtime -d main.jar && java -jar main.jar"
        else -> throw IllegalArgumentException("Unsupported language: $language")
    }

    private suspend fun getResult(codeDir: Path, command: String, id: SolutionId): ExecutionResult {
        lateinit var result: ExecutionResult
        val containerName = "runner-${id.value}"
        try {
            val process = withContext(Dispatchers.IO) {
                ProcessBuilder(
                    "docker", "run", "--rm",
                    "--name", containerName,
                    "-v", "${toDockerPath(codeDir)}:/code",
                    "multi-lang-runner:latest",
                    "bash", "-c", command
                ).redirectErrorStream(false)
                    .start()
            }

            val finished = withContext(Dispatchers.IO) {
                process.waitFor(TIMEOUT, TimeUnit.MILLISECONDS)
            }
            if (!finished) {
                process.destroyForcibly()

                withContext(Dispatchers.IO) {
                    ProcessBuilder("docker", "rm", "-f", containerName).start().waitFor()
                }

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
