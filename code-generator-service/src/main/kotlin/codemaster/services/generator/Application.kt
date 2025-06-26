package codemaster.services.generator

import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["codemaster.services.generator"])
@EnableRabbit
class Application

@Suppress("SpreadOperator")
fun main(args: Array<String>) {
    println("Starting GeneratorService with args: ${args.joinToString()}")
    runApplication<Application>(*args)
}
