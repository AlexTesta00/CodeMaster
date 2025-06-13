package com.codemaster.solutionservice.interfaces

import codemaster.servicies.solution.Application
import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.interfaces.SolutionController
import io.kotest.common.runBlocking
import io.kotest.core.spec.style.DescribeSpec
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
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
    val languageDTO = SolutionController.LanguageDTORequest(language.name, language.fileExtension)
    val difficulty = Difficulty.Medium
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
    val solutionDTORequest = SolutionController.SolutionDTORequest(
        user,
        questId,
        languageDTO,
        difficulty.name,
        notSolved,
        code,
        testCode
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
                .jsonPath("$.language.name").isEqualTo(language.name)
                .jsonPath("$.code").isEqualTo(code)
                .jsonPath("$.testCode").isEqualTo(testCode)
        }

        it("should return 400 if request params are empty") {
            val invalidRequest = SolutionController.SolutionDTORequest(
                "",
                "",
                languageDTO,
                difficulty.name,
                notSolved,
                "",
                ""
            )

            customWebTestClient.post()
                .uri("$baseUrl/")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus().isBadRequest
        }

        it("should return 400 if language params are empty") {
            val invalidLanguage = SolutionController.LanguageDTORequest("", "")
            val invalidRequest = SolutionController.SolutionDTORequest(
                user,
                questId,
                invalidLanguage,
                difficulty.name,
                notSolved,
                code,
                testCode
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
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
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
                .jsonPath("$.language.name").isEqualTo(language.name)
                .jsonPath("$.code").isEqualTo(code)
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
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
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
                .jsonPath("$[0].language.name").isEqualTo(language.name)
                .jsonPath("$[0].code").isEqualTo(code)
        }
    }

    describe("GET /api/v1/solutions/solved/{user}") {

        beforeTest {
            val solved = true
            val id2 = SolutionId.generate()
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, solved, code, testCode)
                service.addSolution(id2, user, questId, language, difficulty, notSolved, code, testCode)
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

    describe("GET /api/v1/solutions/difficulty/{user}") {

        beforeTest {
            val easy = Difficulty.Easy
            val solved = true
            val id2 = SolutionId.generate()
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, solved, code, testCode)
                service.addSolution(id2, user, questId, language, easy, notSolved, code, testCode)
            }
        }

        it("should find all solved solutions by user and difficulty") {
            customWebTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/difficulty/$user")
                        .queryParam("difficulty", difficulty.name)
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.size()").isEqualTo(1)
                .jsonPath("$[0].user").isEqualTo(user)
                .jsonPath("$[0].solved").isEqualTo(true)
                .jsonPath("$[0].difficulty").isEqualTo(difficulty)
        }

        it("should return 500 internal server error if difficulty is null") {
            customWebTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/difficulty/$user")
                        .queryParam("difficulty", null)
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("GET /api/v1/solutions/users/{user}") {

        beforeTest {
            val user2 = "otherUser"
            val id2 = SolutionId.generate()
            runBlocking {
                service.addSolution(id, user2, questId, language, difficulty, notSolved, code, testCode)
                service.addSolution(id2, user, questId, language, difficulty, notSolved, code, testCode)
            }
        }

        it("should find all submitted by a user") {
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
                .jsonPath("$[0].difficulty").isEqualTo(difficulty)
        }
    }

    describe("GET /api/v1/solutions/language/{questId}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
            }
        }

        it("should find all solutions with given language") {

            customWebTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/language/$questId")
                        .queryParam("name", language.name)
                        .queryParam("extension", language.fileExtension)
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.size()").isEqualTo(1)
                .jsonPath("$[0].user").isEqualTo(user)
                .jsonPath("$[0].questId").isEqualTo(questId)
                .jsonPath("$[0].language.name").isEqualTo(language.name)
                .jsonPath("$[0].code").isEqualTo(code)
        }

        it("should return 400 bad request if language name and extension are null") {

            customWebTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/language/$questId")
                        .queryParam("name", null)
                        .queryParam("extension", null)
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isBadRequest
        }

        it("should return 400 bad request if language name and extension are blank") {

            customWebTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/language/$questId")
                        .queryParam("name", "")
                        .queryParam("extension", "")
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("PUT /api/v1/solutions/difficulty/{id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
            }
        }

        it("should change difficulty of solution correctly") {
            val newDifficulty = Difficulty.Easy

            customWebTestClient.put()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/difficulty/$id")
                        .queryParam("difficulty", newDifficulty.name)
                        .build()
                }
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.difficulty.name").isEqualTo(newDifficulty.name)
        }

        it("should return 500 if difficulty is null") {

            customWebTestClient.put()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/difficulty/$id")
                        .queryParam("difficulty", null)
                        .build()
                }
                .exchange()
                .expectStatus().isBadRequest
        }

        it("should return 404 if id is not found") {
            val fakeId = SolutionId.generate()

            customWebTestClient.put()
                .uri { uriBuilder ->
                    uriBuilder.path("$baseUrl/difficulty/$fakeId")
                        .queryParam("difficulty", difficulty)
                        .build()
                }
                .exchange()
                .expectStatus().isNotFound
        }

    }

    describe("PUT /api/v1/solutions/language/{id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
            }
        }

        it("should update the language of solution correctly") {
            val newLanguage = Language("Scala", ".scala")
            val request = SolutionController.LanguageDTORequest(newLanguage.name, newLanguage.fileExtension)

            customWebTestClient.put()
                .uri("$baseUrl/language/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.language.name").isEqualTo(newLanguage.name)
                .jsonPath("$.language.fileExtension").isEqualTo(newLanguage.fileExtension)
        }

        it("should return 404 if the solution is not found") {
            val fakeId = SolutionId.generate()
            val newLanguage = SolutionController.LanguageDTORequest("Scala", ".scala")

            customWebTestClient.put()
                .uri("$baseUrl/language/$fakeId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newLanguage)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if the id is invalid") {
            val invalidId = null
            val newLanguage = Language("Scala", ".scala")

            customWebTestClient.put()
                .uri("$baseUrl/language/$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newLanguage)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 400 if the id is invalid") {
            val invalidId = null
            val newLanguage = Language("", "")

            customWebTestClient.put()
                .uri("$baseUrl/language/$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(mapOf("language" to newLanguage))
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("PUT /api/v1/solutions/code/{id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
            }
        }

        it("should update the code of solution correctly") {
            val newCode = "new code"

            customWebTestClient.put()
                .uri("$baseUrl/code/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.code").isEqualTo(newCode)
        }

        it("should return 404 if the solution is not found") {
            val fakeId = SolutionId.generate()
            val newCode = "new code"

            customWebTestClient.put()
                .uri("$baseUrl/code/$fakeId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if the id is invalid") {
            val invalidId = null
            val newCode = "new code"

            customWebTestClient.put()
                .uri("$baseUrl/code/$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 400 if the code is blank") {
            val newCode = ""

            customWebTestClient.put()
                .uri("$baseUrl/code/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("PUT /api/v1/solutions/test-code/{id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
            }
        }

        it("should update the code of solution correctly") {
            val newTestCode = "new test code"

            customWebTestClient.put()
                .uri("$baseUrl/test-code/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newTestCode)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.testCode").isEqualTo(newTestCode)
        }

        it("should return 404 if the solution is not found") {
            val fakeId = SolutionId.generate()
            val newTestCode = "new test code"

            customWebTestClient.put()
                .uri("$baseUrl/test-code/$fakeId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newTestCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if the id is invalid") {
            val invalidId = null
            val newTestCode = "new test code"

            customWebTestClient.put()
                .uri("$baseUrl/test-code/$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newTestCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 400 if the test code is blank") {
            val newTestCode = ""

            customWebTestClient.put()
                .uri("$baseUrl/test-code/id=$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newTestCode)
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

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
                service.addSolution(failSolutionId, user, questId, language, difficulty, notSolved, code, failingTests)
                service.addSolution(
                    exceptionSolutionId,
                    user,
                    questId,
                    language,
                    difficulty,
                    notSolved,
                    code,
                    runtimeException
                )
            }
        }

        it("should execute the code correctly") {
            val expectedResult = ExecutionResult.Accepted(listOf("testFunction1() [OK]"), 0)

            customWebTestClient.put()
                .uri("$baseUrl/execute/$id")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(code)
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
                .bodyValue(code)
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
            val expectedResult = ExecutionResult.TestsFailed(
                "Tests failed",
                listOf("testFunction1() [X] Cannot invoke \"String.toUpperCase()\" because \"<parameter1>\" is null"),
                1
            )

            customWebTestClient.put()
                .uri("$baseUrl/execute/$exceptionSolutionId")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
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
                .bodyValue(loop)
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
                .bodyValue(code)
                .exchange()
                .expectStatus().isNotFound
        }
    }

    describe("PUT /api/v1/solutions/compile/{id}") {

        val nonCompilingCode = """
                static String myPrint(String s) {
                    return s;
                
            """.trimIndent()

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
            }
        }

        it("should compile the code correctly") {
            val output = emptyList<String>()

            customWebTestClient.put()
                .uri("$baseUrl/compile/$id")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(code)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$").isEqualTo(ExecutionResult.Accepted(output, 0))
        }

        it("should fail the execution if the code can't compile") {

            customWebTestClient.put()
                .uri("$baseUrl/compile/$id")
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(nonCompilingCode)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.error").isEqualTo("Compilation failed")
        }
    }

    describe("DELETE /api/v1/solutions/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, difficulty, notSolved, code, testCode)
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
