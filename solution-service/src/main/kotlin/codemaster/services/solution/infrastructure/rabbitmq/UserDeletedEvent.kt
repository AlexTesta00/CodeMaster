package codemaster.services.solution.infrastructure.rabbitmq

import com.fasterxml.jackson.annotation.JsonProperty

data class UserDeletedEvent(
    @field:JsonProperty("value")
    val userId: String
)

