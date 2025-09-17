package codemaster.services.generator.infrastructure.rabbitmq

import org.springframework.amqp.core.*
import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.amqp.support.converter.MessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@EnableRabbit
class RabbitMqConfig {

    @Bean
    fun codequestDeletedQueue(): Queue =
        Queue("generator-codequest-deleted", true)

    @Bean
    fun codequestGenerateQueue(): Queue =
        Queue("generator-codequest-generate", true)

    @Bean
    fun codequestExchange(): TopicExchange =
        TopicExchange("codequest")

    @Bean
    fun codequestDeletedBinding(
        codequestDeletedQueue: Queue,
        codequestExchange: TopicExchange
    ): Binding =
        BindingBuilder.bind(codequestDeletedQueue)
            .to(codequestExchange)
            .with("codequest.deleted")

    @Bean
    fun codequestGenerateBinding(
        codequestGenerateQueue: Queue,
        codequestExchange: TopicExchange
    ): Binding =
        BindingBuilder.bind(codequestGenerateQueue)
            .to(codequestExchange)
            .with("codequest.codegen")

    @Bean
    fun messageConverter(): MessageConverter =
        Jackson2JsonMessageConverter()
}
