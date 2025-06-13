package codemaster.servicies.solution.infrastructure.rabbitmq

import codemaster.servicies.solution.application.SolutionService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

@Component
class RabbitMqEventConsumer(
    private val solutionService: SolutionService
) {
    private val objectMapper = jacksonObjectMapper()

    @RabbitListener(queues = ["solution-user-deleted"])
    suspend fun handleUserDeleted(message: String) {
        val userId = objectMapper.readValue(message, String::class.java)
        println("Received user.deleted event for user: $userId")
        solutionService.deleteSolutionsByUser(userId)
    }

    @RabbitListener(queues = ["solution-codequest-deleted"])
    suspend fun handleCodequestDeleted(message: String) {
        val questId = objectMapper.readValue(message, String::class.java)
        println("Received codequest.delete event for quest: $questId")
        solutionService.deleteSolutionsByCodequest(questId)
    }
}
