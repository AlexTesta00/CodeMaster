package codemaster.services.generator.infrastructure.rabbitmq

import com.fasterxml.jackson.annotation.JsonProperty

data class CodequestDeletedEvent(
    @JsonProperty("questId")
    val questId: String
)
