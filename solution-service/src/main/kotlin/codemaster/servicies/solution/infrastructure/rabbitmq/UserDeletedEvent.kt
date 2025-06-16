package codemaster.servicies.solution.infrastructure.rabbitmq

import com.fasterxml.jackson.annotation.JsonProperty

data class UserDeletedEvent(
    @JsonProperty("value")
    val userId: String
)

