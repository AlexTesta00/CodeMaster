package codemaster.services.generator.domain.events

import com.fasterxml.jackson.annotation.JsonProperty

data class CodequestDeletedEvent(
    @JsonProperty("questId")
    val questId: String
)
