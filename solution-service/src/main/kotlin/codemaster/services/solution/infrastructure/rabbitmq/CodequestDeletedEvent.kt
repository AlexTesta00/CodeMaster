package codemaster.services.solution.infrastructure.rabbitmq

import com.fasterxml.jackson.annotation.JsonProperty

data class CodequestDeletedEvent(
    @field:JsonProperty("questId")
    val questId: String
)
