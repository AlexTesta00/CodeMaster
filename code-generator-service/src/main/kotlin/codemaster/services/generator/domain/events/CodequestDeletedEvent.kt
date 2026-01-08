package codemaster.services.generator.domain.events

import com.fasterxml.jackson.annotation.JsonProperty

data class CodequestDeletedEvent(
    @field:JsonProperty("questId")
    val questId: String
)
