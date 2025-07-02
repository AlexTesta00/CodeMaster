package interfaces

import codemaster.services.generator.Application
import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionParameter
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.TypeName
import codemaster.services.generator.interfaces.dto.ExampleCaseDto
import codemaster.services.generator.interfaces.dto.FunctionParameterDto
import codemaster.services.generator.interfaces.dto.GenerateRequestDto
import codemaster.services.generator.service.CodeGeneratorService
import io.kotest.core.spec.style.DescribeSpec
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Query
import org.springframework.http.MediaType
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.reactive.server.WebTestClient

@SpringBootTest(
    classes = [Application::class],
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@Import(TestRabbitConfig::class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ApiTest (
    @Autowired val webTestClient: WebTestClient,
    @Autowired var reactiveMongoTemplate: ReactiveMongoTemplate,
    @Autowired val service: CodeGeneratorService
) : DescribeSpec({

    val questId = "test-quest"
    val baseUrl = "/api/v1/code-generator"

    val signature = FunctionSignature(
        name = "foo",
        parameters = listOf(FunctionParameter("x", TypeName("Int"))),
        returnType = TypeName("Int")
    )
    val examples = listOf(ExampleCase(inputs = listOf(1), output = 2))
    val languages = listOf(Language.Kotlin, Language.Java)

    val request = GenerateRequestDto(
        questId = questId,
        functionName = "foo",
        parameters = listOf(FunctionParameterDto(name = "x", typeName = "Map<string, string>")),
        returnType = "Map<int, int>",
        examples = listOf(
            ExampleCaseDto(inputs = listOf("{si:no}"), output = "{2:1}")
        ),
        languages = listOf("Kotlin", "Java")
    )

    afterEach {
        runBlocking {
            reactiveMongoTemplate.remove(Query(), CodeQuestCode::class.java).awaitSingleOrNull()
        }
    }

    describe("POST /code-generator/generate") {
        it("should generate code for a codequest") {
            webTestClient.post()
                .uri("$baseUrl/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.questId").isEqualTo(questId)
        }
    }

    describe("GET /code-generator/{questId}") {

        beforeTest {
            runBlocking {
                service.generateQuestCode(
                    questId,
                    signature,
                    examples,
                    languages
                )
            }
        }

        it("should retrieve the generated codequest code") {

            webTestClient.get()
                .uri("$baseUrl/$questId")
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.questId").isEqualTo(questId)
        }
    }
}) {
    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun configureMongoUri(registry: DynamicPropertyRegistry) {
            registry.add("spring.data.mongodb.uri") { "mongodb://localhost:27017/codemaster" }
        }
    }
}
