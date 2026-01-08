package codemaster.services.solution.infrastructure.docker

import codemaster.services.solution.domain.model.ExecutionResult
import codemaster.services.solution.domain.model.Language
import codemaster.services.solution.domain.model.SolutionId
import java.nio.file.Path

interface DockerRunner {

    suspend fun runDocker(
        id: SolutionId,
        codeDir: Path,
        command: String,
        phase: String,
        onComplete: (exitCode: Int, output: String, errors: String) -> ExecutionResult
    ): ExecutionResult

    suspend fun prepareCodeDir(language: Language, code: String, testCode: String): Path

    fun parseJUnitConsoleOutput(output: String): List<String>
}
