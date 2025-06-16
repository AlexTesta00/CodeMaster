package codemaster.servicies.solution.infrastructure.rabbitmq

import codemaster.servicies.solution.application.SolutionService
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import org.springframework.messaging.handler.annotation.Payload

@Component
class Consumer(
    private val solutionService: SolutionService
) {

    @RabbitListener(queues = ["solution-user-deleted"])
    suspend fun handleUserDeleted(@Payload event: UserDeletedEvent) {
        println("Received user.deleted event for user: ${event.userId}")
        solutionService.deleteSolutionsByUser(event.userId)
    }

    @RabbitListener(queues = ["solution-codequest-deleted"])
    suspend fun handleCodequestDeleted(@Payload event: CodequestDeletedEvent) {
        println("Received codequest.delete event for quest: ${event.questId}")
        solutionService.deleteSolutionsByCodequest(event.questId)
    }
}

