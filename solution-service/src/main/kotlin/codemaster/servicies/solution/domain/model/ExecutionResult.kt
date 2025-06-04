package codemaster.servicies.solution.domain.model

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(ExecutionResult.Pending::class, name = "pending"),
    JsonSubTypes.Type(ExecutionResult.Accepted::class, name = "accepted"),
    JsonSubTypes.Type(ExecutionResult.TestsFailed::class, name = "testsFailed"),
    JsonSubTypes.Type(ExecutionResult.CompileFailed::class, name = "compileFailed"),
    JsonSubTypes.Type(ExecutionResult.RuntimeError::class, name = "runtimeError"),
    JsonSubTypes.Type(ExecutionResult.TimeLimitExceeded::class, name = "timeLimitExceeded")
)
sealed class ExecutionResult {

    object Pending : ExecutionResult()

    data class Accepted(
        val output: List<String>,
        val exitCode: Int
    ) : ExecutionResult()

    data class TestsFailed(
        val error: String,
        val output: List<String>,
        val exitCode: Int
    ) : ExecutionResult()

    data class CompileFailed(
        val error: String,
        val stderr: String,
        val exitCode: Int
    ) : ExecutionResult()

    data class RuntimeError(
        val error: String,
        val stderr: String?,
        val exitCode: Int
    ) : ExecutionResult()

    data class TimeLimitExceeded(val timeout: Long) : ExecutionResult()
}
