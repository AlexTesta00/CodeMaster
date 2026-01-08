import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.codegen.GeneratedCodeEntry
import codemaster.services.generator.interfaces.CodeGeneratorController
import codemaster.services.generator.service.CodeGeneratorService
import io.kotest.core.spec.style.DescribeSpec
import io.mockk.coEvery
import io.mockk.mockk
import org.springframework.test.web.reactive.server.WebTestClient

class ApiTest : DescribeSpec({

    val service = mockk<CodeGeneratorService>()
    val controller = CodeGeneratorController(service)

    val client: WebTestClient = WebTestClient.bindToController(controller).build()

    val questId = "test-quest"

    val generated = CodeQuestCode(
        questId = questId,
        entries = listOf(
            GeneratedCodeEntry(
                language = Language.Kotlin,
                templateCode = "fun foo(x: Map<String, String>): Map<Int, Int> = TODO()",
                testCode = "class FooTest { /* Kotlin test code */ }"
            ),
            GeneratedCodeEntry(
                language = Language.Java,
                templateCode = "Map<Integer,Integer> foo(Map<String,String> x) " +
                        "{ throw new UnsupportedOperationException(); }",
                testCode = "public class FooTest { /* Java test code */ }"
            )
        )
    )

    describe("GET /code-generator/{questId}") {
        it("should retrieve the generated codequest code with Kotlin and Java") {
            coEvery { service.getQuestCode(questId) } returns generated

            client.get()
                .uri("/api/v1/code-generator/$questId")
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.questId").isEqualTo(questId)
        }
    }
})
