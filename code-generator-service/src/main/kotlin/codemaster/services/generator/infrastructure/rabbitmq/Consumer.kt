package codemaster.services.generator.infrastructure.rabbitmq

import codemaster.services.generator.service.CodeGeneratorService
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import org.springframework.messaging.handler.annotation.Payload

@Component
class Consumer(
    private val service: CodeGeneratorService
) {

    init {
        println("✅ CONSUMER BEAN CREATO")
    }

    @RabbitListener(queues = ["generator-codequest-deleted"])
    suspend fun handleCodequestDeleted(@Payload event: CodequestDeletedEvent) {
        println("Received codequest.delete event for quest: ${event.questId}")
        service.deleteQuestCode(event.questId)
    }
}

