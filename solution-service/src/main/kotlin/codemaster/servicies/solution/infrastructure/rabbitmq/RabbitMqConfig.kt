package codemaster.servicies.solution.infrastructure.rabbitmq

import org.springframework.amqp.core.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfig {
    @Bean
    fun userDeletedQueue(): Queue = Queue("solution-user-deleted", true)

    @Bean
    fun codequestDeletedQueue(): Queue = Queue("solution-codequest-deleted", true)

    @Bean
    fun userExchange(): TopicExchange = TopicExchange("authentication")

    @Bean
    fun codequestExchange(): TopicExchange = TopicExchange("codequest")

    @Bean
    fun userDeletedBinding(
        userDeletedQueue: Queue,
        userExchange: TopicExchange
    ): Binding =
        BindingBuilder.bind(userDeletedQueue).to(userExchange).with("user.deleted")

    @Bean
    fun codequestDeletedBinding(
        codequestDeletedQueue: Queue,
        codequestExchange: TopicExchange
    ): Binding =
        BindingBuilder.bind(codequestDeletedQueue).to(codequestExchange).with("codequest.delete")
}
