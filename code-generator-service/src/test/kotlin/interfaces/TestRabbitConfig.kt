package interfaces

import org.mockito.Mockito.mock
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean

@TestConfiguration
class TestRabbitConfig {
    @Bean
    fun connectionFactory(): ConnectionFactory {
        return mock(ConnectionFactory::class.java)
    }
}
