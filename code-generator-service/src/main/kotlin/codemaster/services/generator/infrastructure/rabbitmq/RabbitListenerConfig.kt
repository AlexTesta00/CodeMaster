package codemaster.services.generator.infrastructure.rabbitmq

import org.springframework.amqp.core.AcknowledgeMode
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.support.converter.MessageConverter
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitListenerConfig {
    @Bean
    fun rabbitListenerContainerFactory(
        connectionFactory: ConnectionFactory,
        configurer: SimpleRabbitListenerContainerFactoryConfigurer,
        messageConverter: MessageConverter
    ): SimpleRabbitListenerContainerFactory {
        return SimpleRabbitListenerContainerFactory().apply {
            configurer.configure(this, connectionFactory)
            setMessageConverter(messageConverter)
            setAcknowledgeMode(AcknowledgeMode.MANUAL)
        }
    }
}
