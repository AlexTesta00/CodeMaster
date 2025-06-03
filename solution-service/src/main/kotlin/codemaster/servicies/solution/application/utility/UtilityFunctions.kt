package codemaster.servicies.solution.application.utility

import codemaster.servicies.solution.application.SolutionService.Companion.TIMEOUT
import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Language
import codemaster.servicies.solution.domain.model.Solution
import codemaster.servicies.solution.domain.model.SolutionId
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.TimeUnit
import kotlin.Comparator

object UtilityFunctions {

    private fun resolveRunnerPath(): Path {
        val envPath = System.getenv("SOLUTION_RUNNER_PATH")?.takeIf { it.isNotBlank() }
        val runnerPath = envPath ?: Paths.get(".", "runner-cache").toString()
        return Paths.get(runnerPath).toAbsolutePath().normalize()
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

    private fun generateSource(code: String, testCode: String, language: Language, type: String): String {
        val templatePath = "/templates/${type}/${language.name}Template"
        val resource = javaClass.getResource(templatePath)
            ?: error("Template not found: $templatePath")

        return resource.readText()
            .replace("// TEST_CODE_HERE", testCode)
            .replace("// USER_CODE_HERE", code)
    }

    suspend fun prepareCodeDir(solution: Solution): Path {
        val codeDir = resolveRunnerPath()
        val sourceMainFile = codeDir.resolve("Main${solution.language.fileExtension}")
        val sourceTestFile = codeDir.resolve("MainTest${solution.language.fileExtension}")

        withContext(Dispatchers.IO) {
            if (Files.exists(codeDir)) {
                Files.walk(codeDir)
                    .sorted(Comparator.reverseOrder())
                    .filter { it != codeDir }
                    .forEach(Files::deleteIfExists)
            } else {
                Files.createDirectories(codeDir)
            }

            Files.writeString(
                sourceMainFile,
                generateSource(solution.code, solution.testCode, solution.language, "main")
            )
            Files.writeString(
                sourceTestFile,
                generateSource(solution.code, solution.testCode, solution.language, "test")
            )
        }

        return codeDir
    }

    suspend fun runDocker(
        id: SolutionId,
        codeDir: Path,
        command: String,
        phase: String,
        onComplete: (exitCode: Int, output: String, errors: String) -> ExecutionResult
    ): ExecutionResult = withContext(Dispatchers.IO) {
        val containerName = "runner-${id.value}-$phase"

        val tarProcess = ProcessBuilder("tar", "-C", codeDir.toString(), "-cf", "-", ".").start()

        val wrappedCommand = """
            mkdir -p /code && chmod 777 /code && cd /code && tar -xf - && $command
        """.trimIndent()

        try {
            val process = ProcessBuilder(
                "docker", "run", "--rm",
                "--name", containerName,
                "-i", "multi-lang-runner:latest",
                "sh", "-c", wrappedCommand
            ).apply {
                if (phase == "run") redirectErrorStream(true)
            }.start()

            tarProcess.inputStream.copyTo(process.outputStream)
            process.outputStream.close()

            val finished = process.waitFor(TIMEOUT, TimeUnit.MILLISECONDS)
            if (!finished) {
                process.destroyForcibly()
                return@withContext ExecutionResult.TimeLimitExceeded(TIMEOUT)
            }

            val output = process.inputStream.readAll()
            val errors = process.errorStream.readAll()
            val exitCode = process.exitValue()

            onComplete(exitCode, output, errors)

        } catch (e: Exception) {
            when (phase) {
                "compile" -> ExecutionResult.CompileFailed("Unexpected compile error: ${e.message}", "", -1)
                "run" -> ExecutionResult.RuntimeError("Unexpected runtime error", e.message, -1)
                else -> ExecutionResult.RuntimeError("Unknown error", e.message, -1)
            }
        }
    }

    private fun InputStream.readAll(): String =
        bufferedReader().use { it.readText().trim() }
}
