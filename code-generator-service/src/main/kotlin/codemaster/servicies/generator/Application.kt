package codemaster.servicies.generator

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["codemaster.servicies.generator"])
class Application

@Suppress("SpreadOperator")
fun main(args: Array<String>) {
    println("Starting SolutionService with args: ${args.joinToString()}")
    runApplication<codemaster.servicies.generator.Application>(*args)
}