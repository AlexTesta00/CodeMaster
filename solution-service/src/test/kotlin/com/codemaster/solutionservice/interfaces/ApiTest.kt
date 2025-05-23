package com.codemaster.solutionservice.interfaces

import codemaster.servicies.solution.Application
import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.interfaces.SolutionController
import io.kotest.common.runBlocking
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Query
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
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
    val testCode = """
        String input1 = "test1";
        String input2 = "test2";
        System.out.println(myPrint(input1));
        System.out.println(myPrint(input2));
    """.trimIndent()
    val code = """
        public static String myPrint(String s) {
            return "Hello World! " + s;
        }
    """.trimIndent()
    val solutionDTORequest = SolutionController.SolutionDTORequest(user, questId, language, code, testCode)

    afterEach {
        runBlocking {
            mongoTemplate.remove(Query(), Solution::class.java).awaitSingleOrNull()
        }
    }

    describe("POST /solutions/") {

        it("should add new solution correctly") {

            webTestClient.post()
                .uri("/solutions/")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(solutionDTORequest)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.user").isEqualTo(user)
                .jsonPath("$.questId").isEqualTo(questId)
                .jsonPath("$.language.name").isEqualTo(language.name)
                .jsonPath("$.code").isEqualTo(code)
                .jsonPath("$.testCode").isEqualTo(testCode)
        }

        it("should return 400 if request params are empty") {
            val invalidRequest = SolutionController.SolutionDTORequest("", "", language, "", "")

            webTestClient.post()
                .uri("/solutions/")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus().isBadRequest
        }

        it("should return 400 if language params are empty") {
            val invalidLanguage = Language("", "")
            val invalidRequest = SolutionController.SolutionDTORequest(user, questId, invalidLanguage, code, testCode)

            webTestClient.post()
                .uri("/solutions/")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("GET /solutions/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should return a solution by id") {

            webTestClient.get()
                .uri("/solutions/id=$id")
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

            webTestClient.get()
                .uri("/solutions/id=$fakeId")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound
        }
    }

    describe("GET /solutions/questId={questId}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should return all solutions for the given codequest id") {

            webTestClient.get()
                .uri("/solutions/questId=$questId")
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

    describe("GET /solutions/language") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should find all solutions with given language") {

            webTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("/solutions/language/")
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

            webTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("/solutions/language/")
                        .queryParam("name", null)
                        .queryParam("extension", null)
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isBadRequest
        }

        it("should return 400 bad request if language name and extension are blank") {

            webTestClient.get()
                .uri { uriBuilder ->
                    uriBuilder.path("/solutions/language/")
                        .queryParam("name", "")
                        .queryParam("extension", "")
                        .build()
                }
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("PUT /solutions/language/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should update the language of solution correctly") {
            val newLanguage = Language("Scala", ".scala")
            val request = SolutionController.LanguageDTORequest(newLanguage)

            webTestClient.put()
                .uri("/solutions/language/id=$id")
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
            val newLanguage = Language("Scala", ".scala")

            webTestClient.put()
                .uri("/solutions/language/id=$fakeId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(mapOf("language" to newLanguage))
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if the id is invalid") {
            val invalidId = null
            val newLanguage = Language("Scala", ".scala")

            webTestClient.put()
                .uri("/solutions/language/id=$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(mapOf("language" to newLanguage))
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 400 if the id is invalid") {
            val invalidId = null
            val newLanguage = Language("", "")

            webTestClient.put()
                .uri("/solutions/language/id=$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(mapOf("language" to newLanguage))
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("PUT /solutions/code/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should update the code of solution correctly") {
            val newCode = "new code"

            webTestClient.put()
                .uri("/solutions/code/id=$id")
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

            webTestClient.put()
                .uri("/solutions/code/id=$fakeId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if the id is invalid") {
            val invalidId = null
            val newCode = "new code"

            webTestClient.put()
                .uri("/solutions/code/id=$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 400 if the code is blank") {
            val newCode = ""

            webTestClient.put()
                .uri("/solutions/code/id=$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCode)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("PUT /solutions/test-code/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should update the code of solution correctly") {
            val newTestCode = "new test code"

            webTestClient.put()
                .uri("/solutions/test-code/id=$id")
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

            webTestClient.put()
                .uri("/solutions/test-code/id=$fakeId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newTestCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if the id is invalid") {
            val invalidId = null
            val newTestCode = "new test code"

            webTestClient.put()
                .uri("/solutions/test-code/id=$invalidId")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newTestCode)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 400 if the test code is blank") {
            val newTestCode = ""

            webTestClient.put()
                .uri("/solutions/test-code/id=$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newTestCode)
                .exchange()
                .expectStatus().isBadRequest
        }
    }

    describe("GET /solutions/execute/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should execute the code correctly") {
            val expectedResult = ExecutionResult.Accepted("Hello World! test1\nHello World! test2", 0)

            webTestClient.get()
                .uri("/solutions/execute/id=$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.result").isEqualTo(expectedResult)
        }

        it("should fail the execution if the code can't compile") {
            val nonCompilingCode = """
                private String print(String s) {
                    return s;
                
            """.trimIndent()
            service.modifySolutionCode(id, nonCompilingCode)

            val expectedResult = ExecutionResult.Failed(error = "Non-zero exit code",
                "Main.java:12: error: reached end of file while parsing\n" +
                        "}\n" +
                        " ^\n" +
                        "1 error",
                exitCode = 1)

            webTestClient.get()
                .uri("/solutions/execute/id=$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.result").isEqualTo(expectedResult)
        }

        it("should fail if there is a runtime exception") {
            val newCode =
                """
                    public static Integer myPrint(String s) {
                        return s.length();
                    }
                """.trimIndent()

            val failingTestCode = """
                    String input = null;
                    System.out.println(myPrint(input));
            """.trimIndent()

            val expectedResult = ExecutionResult.Failed(error = "Non-zero exit code",
                "Exception in thread \"main\" java.lang.NullPointerException: " +
                        "Cannot invoke \"String.length()\" because \"<parameter1>\" is null\n" +
                        "\tat Main.myPrint(Main.java:8)\n" +
                        "\tat Main.main(Main.java:4)", exitCode = 1)

            service.modifySolutionCode(id, newCode)
            service.modifySolutionTestCode(id, failingTestCode)

            webTestClient.get()
                .uri("/solutions/execute/id=$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)
                .jsonPath("$.result").isEqualTo(expectedResult)
        }

        it("should exceed the timeout") {
            val loop = """
                public static Void myPrint(String s) {
                    while(true) {}
                }
            """.trimIndent()

            service.modifySolutionCode(id, loop)

            val customClient = webTestClient.mutate()
                .responseTimeout(Duration.ofSeconds(25))
                .build()

            customClient
                .get()
                .uri("/solutions/execute/id=$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.REQUEST_TIMEOUT)
        }

        it("should return 404 if no solution match the id") {
            val fakeId = SolutionId.generate()

            webTestClient.get()
                .uri("/solutions/execute/id=$fakeId")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound
        }
    }

    describe("DELETE /solutions/id={id}") {

        beforeTest {
            runBlocking {
                service.addSolution(id, user, questId, language, code, testCode)
            }
        }

        it("should delete the solution correctly") {

            webTestClient.delete()
                .uri("/solutions/id=$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk
                .expectBody()
                .jsonPath("$.id").isEqualTo(id)

            webTestClient.get()
                .uri("/solutions/id=$id")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound
        }

        it("should return 404 if there is no solution with given id") {
            val fakeId = SolutionId.generate()

            webTestClient.delete()
                .uri("/solutions/id=$fakeId")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isNotFound
        }
    }
})

