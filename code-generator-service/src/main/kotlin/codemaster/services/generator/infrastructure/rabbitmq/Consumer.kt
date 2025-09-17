package codemaster.services.generator.infrastructure.rabbitmq

import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionParameter
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.TypeName
import codemaster.services.generator.domain.events.CodequestDeletedEvent
import codemaster.services.generator.domain.events.GenerateCodeEvent
import codemaster.services.generator.interfaces.parser.Parser.parseValue
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

    @RabbitListener(queues = ["generator-codequest-generate"])
    suspend fun handleCodequestGenerate(@Payload event: GenerateCodeEvent) {
        println("Received codequest.codegen event for quest: ${event.questId}")
        val signature = FunctionSignature(
            name = event.functionName,
            parameters = event.parameters.map {
                FunctionParameter(it.name, TypeName(it.typeName))
            },
            returnType = TypeName(event.returnType)
        )

        val parsedExamples = event.examples.map { example ->
            val parsedInputs = example.inputs.mapIndexed { index, inputValue ->
                val expectedType = signature.parameters[index].type
                parseValue(inputValue, expectedType)
            }
            val parsedOutput = parseValue(example.output, signature.returnType)

            ExampleCase(
                inputs = parsedInputs,
                output = parsedOutput
            )
        }

        val langs = event.language.map { Language.valueOf(it) }

        service.generateQuestCode(
            questId = event.questId,
            signature = signature,
            examples = parsedExamples,
            languages = langs
        )
    }
}
