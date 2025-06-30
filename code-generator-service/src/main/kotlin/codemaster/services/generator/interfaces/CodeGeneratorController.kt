package codemaster.services.generator.interfaces

import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionParameter
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.TypeName
import codemaster.services.generator.interfaces.dto.GenerateRequestDto
import codemaster.services.generator.interfaces.parser.Parser.parseValue
import codemaster.services.generator.service.CodeGeneratorService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/code-generator")
class CodeGeneratorController(
    private val service: CodeGeneratorService,
) {

    @GetMapping("/health", produces = ["application/json"])
    suspend fun healthCheck(): ResponseEntity<Map<String, Any>> {
        val mongoReady = try {
            service.pingMongo()
            true
        } catch (e: Exception) {
            false
        }

        return if (mongoReady) {
            ResponseEntity.ok(
                mapOf(
                    "status" to "OK",
                    "success" to true
                )
            )
        } else {
            ResponseEntity.internalServerError().body(
                mapOf(
                    "status" to "Service Unavailable",
                    "success" to false,
                    "mongo" to mongoReady
                )
            )
        }
    }

    @PostMapping("/generate")
    suspend fun generateCode(@RequestBody request: GenerateRequestDto): ResponseEntity<CodeQuestCode?> {

        val signature = FunctionSignature(
            name = request.functionName,
            parameters = request.parameters.map {
                FunctionParameter(it.name, TypeName(it.typeName))
            },
            returnType = TypeName(request.returnType)
        )

        val parsedExamples = request.examples.map { example ->
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

        val langs = request.languages.map { Language.valueOf(it) }

        val savedCode = service.generateQuestCode(
            questId = request.questId,
            signature = signature,
            examples = parsedExamples,
            languages = langs
        )

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(savedCode)
    }

    @GetMapping("/{questId}")
    suspend fun getCode(@PathVariable questId: String): ResponseEntity<CodeQuestCode?> {
        val code: CodeQuestCode

        try {
            code = service.getQuestCode(questId)
        } catch(ex: NoSuchElementException) {
            return ResponseEntity.internalServerError().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(code)
    }
}
