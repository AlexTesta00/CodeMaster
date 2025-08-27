package com.codemaster.solutionservice.interfaces

import codemaster.servicies.solution.Application
import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.dto.SolutionsDTO.*
import codemaster.servicies.solution.infrastructure.SolutionRepository
import codemaster.servicies.solution.infrastructure.docker.DockerRunner
import codemaster.servicies.solution.interfaces.SolutionController
import com.codemaster.solutionservice.utility.Utility.monoOf
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.coEvery
import io.mockk.mockk
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.reactive.server.WebTestClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@ContextConfiguration(classes = [Application::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles("test")
class ApiTest : DescribeSpec() {

    override fun extensions() = listOf(SpringExtension)

    private val repository = mockk<SolutionRepository>()
    private val runner = mockk<DockerRunner>()
    private val service = SolutionService(repository, runner)
    private val controller = SolutionController(service)
    private val client: WebTestClient = WebTestClient.bindToController(controller).build()

    private val user = "user"
    private val questId = "test"
    private val language = Language("Java", ".java")
    private val languageDTO = LanguageDTORequest(language.name, language.fileExtension)
    private val notSolved = false
    private val code = """
        static String myPrint(String s) {
            return "Hello World! " + s;
        }
    """.trimIndent()
    private val codesDTO = listOf(CodeDTORequest(languageDTO, code))
    private val solutionDTORequest = SolutionDTORequest(user, questId, notSolved, codesDTO)
    private val baseUrl = "/api/v1/solutions"
    private val fakeId = SolutionId.generate()

    init {
        beforeTest {
            // Mock dei dati
            val sol = Solution(
                id = SolutionId.generate(),
                codes = codesDTO.map { Code(Language(it.language.name, it.language.fileExtension), it.code) },
                questId = questId,
                user = user,
                result = ExecutionResult.Pending,
                solved = notSolved
            )

            coEvery { repository.addNewSolution(any()) } returns monoOf(sol)
            coEvery { repository.findSolutionById(sol.id) } returnsMany listOf(monoOf(sol), Mono.empty())
            coEvery { repository.findSolutionById(fakeId) } returns Mono.empty()
            coEvery { repository.findSolutionsByQuestId(questId) } returns Flux.just(sol, sol, sol, sol)
            coEvery { repository.findSolvedSolutionsByUser(user) } returns Flux.just(sol.copy(solved = true))
            coEvery { repository.findSolutionsByUser(user) } returns Flux.just(sol, sol, sol, sol, sol, sol)
            coEvery { repository.removeSolutionById(sol.id) } returns monoOf(sol)
        }

        describe("POST /api/v1/solutions/") {
            it("should add new solution correctly") {
                client.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(solutionDTORequest)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.user").isEqualTo(user)
                    .jsonPath("$.questId").isEqualTo(questId)
                    .jsonPath("$.codes[0].code").isEqualTo(code)
                    .jsonPath("$.codes[0].language.name").isEqualTo(language.name)
            }
        }

        describe("GET /api/v1/solutions/{id}") {
            it("should return a solution by id") {
                val solId = SolutionId.generate()
                coEvery { repository.findSolutionById(solId) } returns monoOf(
                    Solution(
                        id = solId,
                        codes = codesDTO.map { Code(Language(it.language.name, it.language.fileExtension), it.code) },
                        questId = questId,
                        user = user,
                        result = ExecutionResult.Pending,
                        solved = notSolved
                    )
                )

                client.get()
                    .uri("$baseUrl/$solId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
            }

            it("should return 404 if not found") {

                client.get()
                    .uri("$baseUrl/$fakeId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isNotFound
            }
        }

        describe("GET /api/v1/solutions/codequests/{questId}") {
            it("should return all solutions for the given codequest id") {
                client.get()
                    .uri("$baseUrl/codequests/$questId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.size()").isEqualTo(4)
            }
        }

        describe("GET /api/v1/solutions/solved/{user}") {
            it("should find all solved solutions by a user") {
                client.get()
                    .uri("$baseUrl/solved/$user")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.size()").isEqualTo(1)
            }
        }

        describe("GET /api/v1/solutions/users/{user}") {
            it("should find all solutions submitted by a user") {
                client.get()
                    .uri("$baseUrl/users/$user")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.size()").isEqualTo(6)
            }
        }

        describe("DELETE /api/v1/solutions/id={id}") {
            val solId = SolutionId("delete-test-id")

            beforeTest {
                val sol = Solution(
                    id = solId,
                    codes = codesDTO.map { Code(Language(it.language.name, it.language.fileExtension), it.code) },
                    questId = questId,
                    user = user,
                    result = ExecutionResult.Pending,
                    solved = notSolved
                )

                coEvery { repository.removeSolutionById(solId) } returns monoOf(sol)
            }

            it("should delete the solution correctly") {
                client.delete()
                    .uri("$baseUrl/$solId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
            }

            it("should return 404 if there is no solution with given id") {
                val fakeId = SolutionId("nonexistent-id")
                coEvery { repository.removeSolutionById(fakeId) } returns Mono.empty()

                client.delete()
                    .uri("$baseUrl/$fakeId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isNotFound
            }
        }
    }
}
