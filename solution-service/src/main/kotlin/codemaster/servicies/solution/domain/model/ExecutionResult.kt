package codemaster.servicies.solution.domain.model

sealed class ExecutionResult {
    data object Pending : ExecutionResult()

    data class Accepted(
        val output: List<String>,
        val exitCode: Int
    ) : ExecutionResult()

    data class Failed(
        val error: String,
        val stderr: String,
        val exitCode: Int
    ) : ExecutionResult()

    data class TimeLimitExceeded(val timeout: Long) : ExecutionResult()
}
