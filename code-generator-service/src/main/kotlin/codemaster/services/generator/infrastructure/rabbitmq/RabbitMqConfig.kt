package codemaster.services.generator.infrastructure.rabbitmq

import org.springframework.amqp.core.*
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.amqp.support.converter.MessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfig {
    @Bean
    fun codequestDeletedQueue(): Queue = Queue("generator-codequest-deleted", true)

    @Bean
    fun codequestExchange(): TopicExchange = TopicExchange("codequest")

    @Bean
    fun codequestDeletedBinding(
        codequestDeletedQueue: Queue,
        codequestExchange: TopicExchange
    ): Binding =
        BindingBuilder.bind(codequestDeletedQueue).to(codequestExchange).with("codequest.deleted")

    @Bean
    fun messageConverter(): MessageConverter {
        return Jackson2JsonMessageConverter()
    }
}

