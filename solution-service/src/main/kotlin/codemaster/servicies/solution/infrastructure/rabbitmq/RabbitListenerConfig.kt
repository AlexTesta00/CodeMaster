package codemaster.servicies.solution.infrastructure.rabbitmq

import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitListenerConfig {
    @Bean
    fun rabbitListenerContainerFactory(connectionFactory: ConnectionFactory): RabbitListenerContainerFactory<*> {
        val factory = SimpleRabbitListenerContainerFactory()
        factory.setConnectionFactory(connectionFactory)
        return factory
    }
}