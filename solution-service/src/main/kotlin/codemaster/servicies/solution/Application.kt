package codemaster.servicies.solution

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
import org.springframework.boot.runApplication

@SpringBootApplication(exclude = [DataSourceAutoConfiguration::class])
class Application

@Suppress("SpreadOperator")
fun main(args: Array<String>) {
    println("Starting SolutionService with args: ${args.joinToString()}")
    runApplication<Application>(*args)
}

