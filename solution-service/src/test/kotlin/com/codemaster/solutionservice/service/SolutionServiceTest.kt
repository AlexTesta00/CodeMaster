package com.codemaster.solutionservice.service

import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.errors.InvalidUserException
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.infrastructure.SolutionRepository
import codemaster.servicies.solution.infrastructure.docker.DockerRunner
import com.codemaster.solutionservice.utility.Utility.monoOf
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.runTest
import reactor.core.publisher.Mono
import reactor.core.publisher.Flux

class SolutionServiceTest : DescribeSpec({

    val repository = mockk<SolutionRepository>()
    val runner = mockk<DockerRunner>()

    val service = SolutionService(repository, runner)

    val id1 = SolutionId.generate()
    val id2 = SolutionId.generate()
    val user = "user"
    val questId = "test"
    val language = Language("Kotlin", ".kt")
    val notSolved = false
    val solved = true
    val code = """
        companion object {
            @JvmStatic
            fun myPrint(s: String?): String {
                return "Hello World! " + s
            }
        }
    """.trimIndent()

    val codes = listOf(Code(language, code))

    fun buildSolution(id: SolutionId, solved: Boolean) =
        Solution(id, codes, questId, user, ExecutionResult.Pending, solved)

    fun checkSolution(solution: Solution) {
        solution.id shouldBe id1
        solution.result.shouldBeInstanceOf<ExecutionResult.Pending>()
        solution.questId shouldBe questId
        for (cd in codes) {
            cd.code shouldBe code
            cd.language shouldBe language
        }
    }

    describe("SolutionServiceTest") {

        context("Add new solution") {
            it("should save and retrieve solution correctly") {
                val sol = buildSolution(id1, notSolved)

                coEvery { repository.addNewSolution(any()) } returns Mono.just(sol)
                coEvery { repository.findSolutionById(id1) } returns Mono.just(sol)

                val saved = service.addSolution(id1, user, questId, notSolved, codes)

                checkSolution(saved)
            }

            it("should throw exception if username is invalid") {
                shouldThrow<InvalidUserException> {
                    service.addSolution(id1, "", questId, notSolved, codes)
                }
            }
        }

        context("Find solution") {
            val sol1 = buildSolution(id1, notSolved)
            val sol2 = buildSolution(id2, solved)

            beforeTest {
                coEvery { repository.addNewSolution(sol1) } returns Mono.just(sol1)
                coEvery { repository.addNewSolution(sol2) } returns Mono.just(sol2)
                coEvery { repository.findSolutionById(id1) } returns Mono.just(sol1)
                coEvery { repository.findSolutionById(id2) } returns Mono.just(sol2)
                coEvery { repository.findSolutionsByQuestId(questId) } returns Flux.just(sol1, sol2)
                coEvery { repository.findSolvedSolutionsByUser(user) } returns Flux.just(sol2)
                coEvery { repository.findSolutionsByUser(user) } returns Flux.just(sol1, sol2)
            }

            it("should retrieve solution by his id") {
                val founded = service.getSolution(id1)

                founded shouldNotBe null
                checkSolution(founded)
            }

            it("should retrieve all solutions with the same questId") {
                val list = service.getSolutionsByQuestId(questId)

                list.size shouldBe 2
                checkSolution(list.first())

                list.last().id shouldBe id2
                list.last().questId shouldBe questId
                list.last().result.shouldBeInstanceOf<ExecutionResult.Pending>()
            }

            it("should retrieve all solutions solved by a user") {
                val list = service.getSolvedSolutionsByUser(user)

                list.size shouldBe 1
                list.last().id shouldBe id2
                list.last().solved shouldBe true
                list.last().user shouldBe user
            }

            it("should retrieve all solutions submitted by a user") {
                val list = service.getSolutionsByUser(user)

                list.size shouldBe 2
                checkSolution(list.first())
                list.last().id shouldBe id2
            }

            it("should throw exception if there is no solution with given id") {
                val fakeId = SolutionId.generate()
                coEvery { repository.findSolutionById(fakeId) } returns Mono.empty()

                shouldThrow<NoSuchElementException> {
                    service.getSolution(fakeId)
                }
            }

            it("should be empty if there are no solutions with given questId") {
                coEvery { repository.findSolutionsByQuestId("fakeId") } returns Flux.empty()

                service.getSolutionsByQuestId("fakeId").isEmpty() shouldBe true
            }
        }

        describe("Modify solution") {
            val fakeId = SolutionId.generate()
            val newCode = """
                private String print(String s) {
                    return s;
                }
            """.trimIndent()

            val sol = buildSolution(id1, notSolved)

            beforeTest {
                coEvery { repository.findSolutionById(id1) } returns Mono.just(sol)
                coEvery { repository.updateCode(id1, any(), any()) } answers {
                    val updatedCode = arg<String>(1)
                    val lang = arg<Language>(2)
                    val updatedSolution = sol.copy(
                        codes = sol.codes.map { if (it.language == lang) it.copy(code = updatedCode) else it }
                    )
                    Mono.just(updatedSolution)
                }
            }

            it("should modify solution code correctly") {
                val modifiedSolution = service.modifySolutionCode(id1, newCode, language)

                modifiedSolution.codes.first { it.language == language }.code shouldBe newCode
            }

            it("should throw exception if there is no solution with given id") {
                coEvery { repository.findSolutionById(fakeId) } returns Mono.empty()
                coEvery { repository.updateCode(any(), any(), any()) } returns Mono.empty()

                val exception = kotlin.runCatching {
                    service.modifySolutionCode(fakeId, newCode, language)
                }.exceptionOrNull()

                exception.shouldBeInstanceOf<NoSuchElementException>()
            }
        }

        describe("Delete solution") {

            it("should delete solution correctly by id") {
                val sol = buildSolution(id1, notSolved)

                coEvery { repository.addNewSolution(any()) } returns monoOf(sol)
                coEvery { repository.removeSolutionById(id1) } returns monoOf(sol)

                var deleted = false
                coEvery { repository.findSolutionById(id1) } answers {
                    if (!deleted) monoOf(sol)
                    else Mono.empty()
                }

                service.addSolution(id1, user, questId, notSolved, codes)
                deleted = true
                service.deleteSolution(id1)

                val exception = runCatching { service.getSolution(id1) }.exceptionOrNull()
                exception.shouldBeInstanceOf<NoSuchElementException>()
            }


            it("should delete all solutions created by a user") {
                coEvery { repository.removeSolutionsByUser(user) } returns Flux.empty()
                coEvery { repository.findSolutionsByUser(user) } returns Flux.empty()

                service.deleteSolutionsByUser(user) shouldBe emptyList()
            }

            it("should delete all solutions of a codequest") {
                coEvery { repository.removeSolutionsByCodequest(questId) } returns Flux.empty()
                coEvery { repository.findSolutionsByQuestId(questId) } returns Flux.empty()

                service.deleteSolutionsByCodequest(questId) shouldBe emptyList()
            }
        }
    }
})
