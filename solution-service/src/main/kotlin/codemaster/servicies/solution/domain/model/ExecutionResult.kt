package codemaster.servicies.solution.domain.model

sealed class ExecutionResult {
    data object Pending : ExecutionResult()

    data object Accepted : ExecutionResult()

    data class Failed(val error: String) : ExecutionResult()

    data class WrongAnswer(val details: String) : ExecutionResult()

    data class TimeLimitExceeded(val timeout: Long) : ExecutionResult()
}
