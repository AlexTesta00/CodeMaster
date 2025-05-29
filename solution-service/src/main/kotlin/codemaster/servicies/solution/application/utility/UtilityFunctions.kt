package codemaster.servicies.solution.application.utility

import codemaster.servicies.solution.application.SolutionService.Companion.TIMEOUT
import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Language
import codemaster.servicies.solution.domain.model.Solution
import codemaster.servicies.solution.domain.model.SolutionId
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.TimeUnit

object UtilityFunctions {

    private fun resolveRunnerPath(injectedRunnerPath: String): Path {
        val envPath = System.getenv("SOLUTION_RUNNER_PATH")?.takeIf { it.isNotBlank() }
        val runnerPath = envPath ?: injectedRunnerPath.takeIf { it.isNotBlank() }
        ?: Paths.get(System.getProperty("user.dir"), "build", "tmp", "code-run").toString()
        return Paths.get(runnerPath).toAbsolutePath().normalize()
    }

    private fun generateCode(code: String, testCode: String, language: Language): String {
        val main = Files.readString(
            Paths.get(System.getProperty("user.dir"), "templates", "${language.name}MainTemplate")
        ).replace("// TEST_CODE_HERE", testCode)

        return main.replace("// USER_CODE_HERE", code)
    }

    fun parseJUnitConsoleOutput(output: String): List<String> {
        val ansiRegex = Regex("""\u001B\[[0-9;]*m""")
        val testResultRegex = Regex("""\b\w+\(\) \[[A-Z]+]""")
        val treePrefixRegex = Regex("""^\|?\s*['+\\-]*\s*""")

        return output.lines().mapNotNull { line ->
            val cleanLine = ansiRegex.replace(line, "")
            if (testResultRegex.containsMatchIn(cleanLine)) {
                treePrefixRegex.replace(cleanLine, "").trim()
            } else null
        }
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

    suspend fun prepareCodeDir(solution: Solution, injectedRunnerPath: String): Path {
        val codeDir = resolveRunnerPath(injectedRunnerPath)
        val sourceFile = codeDir.resolve("Main${solution.language.fileExtension}")

        withContext(Dispatchers.IO) {
            if (Files.exists(codeDir)) {
                Files.walk(codeDir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(Files::deleteIfExists)
            }
            Files.createDirectories(codeDir)
            Files.writeString(sourceFile, generateCode(solution.code, solution.testCode, solution.language))
        }

        return codeDir
    }

     suspend fun runDockerCommand(
        id: SolutionId,
        codeDir: Path,
        command: String,
        phase: String,
        onComplete: (exitCode: Int, output: String) -> ExecutionResult
    ): ExecutionResult {
        val containerName = "runner-${id.value}-$phase"
        return try {
            val process = withContext(Dispatchers.IO) {
                ProcessBuilder(
                    "docker", "run", "--rm",
                    "--name", containerName,
                    "-v", "${toDockerPath(codeDir)}:/code",
                    "multi-lang-runner:latest",
                    "bash", "-c", command
                ).apply {
                    if (phase == "test") redirectErrorStream(true)
                }.start()
            }

            val finished = withContext(Dispatchers.IO) {
                process.waitFor(TIMEOUT, TimeUnit.MILLISECONDS)
            }

            val stdout: String
            val stderr: String

            if (!finished) {
                process.destroyForcibly()

                withContext(Dispatchers.IO) {
                    ProcessBuilder("docker", "rm", "-f", containerName).start().waitFor()
                }

                ExecutionResult.TimeLimitExceeded(TIMEOUT)
            } else {
                stdout = process.inputStream.bufferedReader().readText().trim()
                stderr = process.errorStream.bufferedReader().readText().trim()
                val exitCode = process.exitValue()

                if (phase == "test") {
                    onComplete(exitCode, stdout)
                } else {
                    onComplete(exitCode, stderr)
                }
            }
        } catch (e: Exception) {
            when (phase) {
                "compile" -> ExecutionResult.CompileFailed("Unexpected compile error: ${e.message}", "", -1)
                "test" -> ExecutionResult.RuntimeError("Unexpected runtime error", e.message, -1)
                else -> ExecutionResult.RuntimeError("Unknown error", e.message, -1)
            }
        }
    }
}
