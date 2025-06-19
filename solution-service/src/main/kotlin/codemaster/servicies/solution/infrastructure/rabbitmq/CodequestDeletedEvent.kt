package codemaster.servicies.solution.infrastructure.rabbitmq

import com.fasterxml.jackson.annotation.JsonProperty

data class CodequestDeletedEvent(
    @JsonProperty("questId")
    val questId: String
)
