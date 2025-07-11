package com.codemaster.solutionservice.interfaces

import codemaster.servicies.solution.Application
import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import io.kotest.common.runBlocking
import io.kotest.core.spec.style.DescribeSpec
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import codemaster.servicies.solution.domain.dto.SolutionsDTO.*
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Query
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.Duration

@SpringBootTest(
    classes = [Application::class],
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ApiTest(
    @Autowired val webTestClient: WebTestClient,
    @Autowired val service: SolutionService,
    @Autowired var mongoTemplate: ReactiveMongoTemplate
) : DescribeSpec({

    val id = SolutionId.generate()
    val user = "user"
    val questId = "test"
    val language = Language("Java", ".java")
    val languageDTO = LanguageDTORequest(language.name, language.fileExtension)
    val notSolved = false
    val testCode =
        """
            @Test
            void testFunction1() {
                assertEquals("Hello World! test", Main.myPrint("test"));
            }
        """.trimIndent()
    val code =
        """
            static String myPrint(String s) {
                return "Hello World! " + s;
            }
        """.trimIndent()

    val codes = mutableListOf<Code>(
        Code(
            language = language,
            code = code
        )
    )

    val codesDTO = listOf<CodeDTORequest>(
        CodeDTORequest(
            languageDTO,
            code
        )
    )

    val solutionDTORequest = SolutionDTORequest(
        user,
        questId,
        notSolved,
        codesDTO
    )

    val baseUrl = "/api/v1/solutions"

    val customWebTestClient = webTestClient.mutate()
        .responseTimeout(Duration.ofSeconds(50))
        .build()

    afterEach {
        runBlocking {
            mongoTemplate.remove(Query(), Solution::class.java).awaitSingleOrNull()
        }
    }

    describe("POST /api/v1/solutions/") {

        it("should add new solution correctly") {

            val bodyContent = customWebTestClient.post()
                .uri("$baseUrl/")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(solutionDTORequest)
                .exchange()
                .expectStatus().isOk
                .expectBody()

            bodyContent.jsonPath("$.user").isEqualTo(user)
                .jsonPath("$.questId").isEqualTo(questId)
                .jsonPath("$.codes[0].code").isEqualTo(code)
                .jsonPath("$.codes[0].language.name").isEqualTo(language.name)
        }

        it("should return 400 if language params are empty") {
            val invalidLanguage = LanguageDTORequest("", "")
            val invalidCodes = listOf<CodeDTORequest>(
                CodeDTORequest(
                    invalidLanguage,
                    code
                )
            )
            val invalidRequest = SolutionDTORequest(
                user,
                questId,
                notSolved,
                invalidCodes
            )

            customWebTestClient.post()
                .uri("$baseUrl/")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("GET /api/v1/solutions/{id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, notSolved, codes)
            }
        }

        it("should return a solution by id") {

            customWebTestClient.get()
                .uri("$baseUrl/$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.user").isEqualTo(user)
                .jsonPath("$.questId").isEqualTo(questId)
                .jsonPath("$.codes[0].code").isEqualTo(code)
                .jsonPath("$.codes[0].language.name").isEqualTo(language.name)
        }

        it("should return 404 if not found") {
            val fakeId = SolutionId.generate()

            customWebTestClient.get()
                .uri("$baseUrl/$fakeId")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound
        }
    }

    describe("GET /api/v1/solutions/codequests/{questId}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, notSolved, codes)
            }
        }

        it("should return all solutions for the given codequest id") {

            customWebTestClient.get()
                .uri("$baseUrl/codequests/$questId")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.size()").isEqualTo(1)
                .jsonPath("$[0].user").isEqualTo(user)
                .jsonPath("$[0].questId").isEqualTo(questId)
                .jsonPath("$.[0].codes[0].code").isEqualTo(code)
                .jsonPath("$.[0].codes[0].language.name").isEqualTo(language.name)
        }
    }

    describe("GET /api/v1/solutions/solved/{user}") {

        beforeTest {
            val solved = true
            val id2 = SolutionId.generate()
            runBlocking {
                service.addSolution(id, user, questId, notSolved, codes)
                service.addSolution(id2, user, questId, solved, codes)
            }
        }

        it("should find all solved solutions by a user") {

            customWebTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/solved/$user")
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.size()").isEqualTo(1)
                .jsonPath("$[0].user").isEqualTo(user)
                .jsonPath("$[0].solved").isEqualTo(true)
        }
    }

    describe("GET /api/v1/solutions/users/{user}") {

        beforeTest {
            val user2 = "otherUser"
            val id2 = SolutionId.generate()
            runBlocking {
                service.addSolution(id, user, questId, notSolved, codes)
                service.addSolution(id2, user2, questId, notSolved, codes)
            }
        }

        it("should find all solutions submitted by a user") {
            customWebTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/users/$user")
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.size()").isEqualTo(1)
                .jsonPath("$[0].user").isEqualTo(user)
                .jsonPath("$[0].solved").isEqualTo(false)
        }
    }

    describe("PUT /api/v1/solutions/code/{id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, notSolved, codes)
            }
        }

        it("should update the code of solution correctly") {
            val newCode = "new code"

            val codeDTO = CodeDTORequest(
                language = languageDTO,
                code = newCode
            )

            customWebTestClient.put()
                .uri("$baseUrl/code/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(codeDTO)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.codes[0].language.name").isEqualTo(language.name)
                .jsonPath("$.codes[0].code").isEqualTo(newCode)
        }

        it("should return 404 if the solution is not found") {
            val fakeId = SolutionId.generate()
            val newCode = "new code"

            val codeDTO = CodeDTORequest(
                language = languageDTO,
                code = newCode
            )

            customWebTestClient.put()
                .uri("$baseUrl/code/$fakeId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(codeDTO)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if the id is invalid") {
            val invalidId = null
            val newCode = "new code"

            val codeDTO = CodeDTORequest(
                language = languageDTO,
                code = newCode
            )

            customWebTestClient.put()
                .uri("$baseUrl/code/$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(codeDTO)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 400 if the code is blank") {
            val newCode = ""

            val codeDTO = CodeDTORequest(
                language = languageDTO,
                code = newCode
            )

            customWebTestClient.put()
                .uri("$baseUrl/code/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(codeDTO)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("PUT /api/v1/solutions/execute/{id}") {

        val loop = """
                static Void myPrint(String s) {
                    while(true) {}
                }
                """.trimIndent()

        val failingTests = """
                @Test
                void testFunction1() {
                    assertEquals("Hello World! test", Main.myPrint("test"));
                }
    
                @Test
                void testFunction2() {
                    assertEquals("Hello World! test", Main.myPrint(""));
                }
            """.trimIndent()

        val runtimeException =
            """
                @Test
                void testFunction1() {
                    assertEquals("test", Main.myPrint(null));
                }
            """.trimIndent()

        val failSolutionId = SolutionId.generate()
        val exceptionSolutionId = SolutionId.generate()

        val executeDTO = ExecuteDTORequest(
            code,
            languageDTO,
            testCode
        )

        val failDTO = ExecuteDTORequest(
            code,
            languageDTO,
            failingTests
        )

        val loopDTO = ExecuteDTORequest(
            loop,
            languageDTO,
            testCode
        )

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, notSolved, codes)
                service.addSolution(failSolutionId, user, questId, notSolved, codes)
                service.addSolution(
                    exceptionSolutionId,
                    user,
                    questId,
                    notSolved,
                    codes
                )
            }
        }

        it("should execute the code correctly") {
            val expectedResult = ExecutionResult.Accepted(listOf("testFunction1() [OK]"), 0)

            customWebTestClient.put()
                .uri("$baseUrl/execute/$id")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(executeDTO)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.result").isEqualTo(expectedResult)
        }

        it("should fail one test") {
            val expectedResult = ExecutionResult.TestsFailed(
                "Tests failed",
                listOf(
                    "testFunction1() [OK]",
                    "testFunction2() [X] expected: <Hello World! test> but was: <Hello World! >"
                ), 1)

            customWebTestClient.put()
                .uri("$baseUrl/execute/$failSolutionId")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(failDTO)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.solved").isEqualTo(false)
                .jsonPath("$.id").isEqualTo(failSolutionId)
                .jsonPath("$.result").isEqualTo(expectedResult)
        }

        it("should fail due to a runtime exception") {
            val newCode =
                """
                    static String myPrint(String input) {
                        return input.toUpperCase();
                    }
                """.trimIndent()

            val exceptionDTO = ExecuteDTORequest(
                newCode,
                languageDTO,
                runtimeException
            )

            val expectedResult = ExecutionResult.TestsFailed(
                "Tests failed",
                listOf("testFunction1() [X] Cannot invoke \"String.toUpperCase()\" because \"<parameter1>\" is null"),
                1
            )

            customWebTestClient.put()
                .uri("$baseUrl/execute/$exceptionSolutionId")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(exceptionDTO)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(exceptionSolutionId)
                .jsonPath("$.result").isEqualTo(expectedResult)
        }

        it("should exceed the timeout") {

            val expectedResult = ExecutionResult.TimeLimitExceeded(20_000)

            customWebTestClient.put()
                .uri("$baseUrl/execute/$id")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(loopDTO)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.result").isEqualTo(expectedResult)
        }

        it("should return 404 if no solution match the id") {
            val fakeId = SolutionId.generate()

            customWebTestClient.put()
                .uri("$baseUrl/execute/$fakeId")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(executeDTO)
                .exchange()
                .expectStatus().isNotFound
        }
    }

    describe("PUT /api/v1/solutions/compile/{id}") {

        val nonCompilingCode = """
                static String myPrint(String s) {
                    return s;
                
            """.trimIndent()

        val compileDTO = ExecuteDTORequest(
            code,
            languageDTO,
            testCode
        )

        val nonCompilingDTO = ExecuteDTORequest(
            nonCompilingCode,
            languageDTO,
            testCode
        )

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, notSolved, codes)
            }
        }

        it("should compile the code correctly") {
            val output = emptyList<String>()

            customWebTestClient.put()
                .uri("$baseUrl/compile/$id")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(compileDTO)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$").isEqualTo(ExecutionResult.Accepted(output, 0))
        }

        it("should fail the execution if the code can't compile") {

            customWebTestClient.put()
                .uri("$baseUrl/compile/$id")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(nonCompilingDTO)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.error").isEqualTo("Compilation failed")
                .jsonPath("$.stderr").isEqualTo("Main.java:12: error: reached end of file while parsing\n" +
                        "}\n" +
                        " ^\n" +
                        "1 error")
        }
    }

    describe("DELETE /api/v1/solutions/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId,  notSolved, codes)
            }
        }

        it("should delete the solution correctly") {

            customWebTestClient.delete()
                .uri("$baseUrl/$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)

            customWebTestClient.get()
                .uri("$baseUrl/$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if there is no solution with given id") {
            val fakeId = SolutionId.generate()

            customWebTestClient.delete()
                .uri("$baseUrl/$fakeId")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound
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
