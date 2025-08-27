package com.codemaster.solutionservice.infrastructure

import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.infrastructure.SolutionRepositoryImpl
import io.kotest.assertions.throwables.shouldThrowAny
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.mockk.*
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactive.asFlow
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Query
import com.codemaster.solutionservice.utility.Utility.fluxOf
import com.codemaster.solutionservice.utility.Utility.monoOf
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.query.Criteria

class SolutionRepositoryTest : DescribeSpec({

    val mongoTemplate = mockk<ReactiveMongoTemplate>()
    val repository = SolutionRepositoryImpl(mongoTemplate)

    val id1 = SolutionId.generate()
    val id2 = SolutionId.generate()
    val id3 = SolutionId.generate()
    val user = "user"
    val questId = "quest"
    val language = Language("Java", ".java")
    val code = Code(language, "System.out.println(\"Hello\");")
    val codes = listOf(code)

    val newSolution1 = SolutionFactoryImpl().create(id1, user, questId, false, codes)
    val newSolution2 = SolutionFactoryImpl().create(id2, user, questId, false, codes)
    val solvedSolution = SolutionFactoryImpl().create(id3, user, questId, true, codes)

    beforeTest {
        clearAllMocks()
    }

    describe("SolutionRepositoryImpl") {

        context("Add new solution") {
            it("should save and return solution") {
                every { mongoTemplate.insert(newSolution1) } returns monoOf(newSolution1)

                val saved = runBlocking { repository.addNewSolution(newSolution1).awaitSingle() }

                saved shouldBe newSolution1
            }
        }

        context("Find solution") {
            it("should return solution by id") {
                every { mongoTemplate.findById(any(), Solution::class.java) } returns monoOf(newSolution1)

                val found = runBlocking { repository.findSolutionById(id1).awaitSingle() }

                found shouldBe newSolution1
            }

            it("should throw if not found") {
                every { mongoTemplate.findById(any(), Solution::class.java) } returns monoOf(null)

                shouldThrowAny {
                    runBlocking { repository.findSolutionById(SolutionId.generate()).awaitSingle() }
                }
            }

            it("should return all solutions by questId") {
                every { mongoTemplate.find(any<Query>(), Solution::class.java) } returns fluxOf(
                    newSolution1,
                    newSolution2
                )

                val results = runBlocking { repository.findSolutionsByQuestId(questId).asFlow().toList() }

                results.size shouldBe 2
                results shouldBe listOf(newSolution1, newSolution2)
            }

            it("should return empty if no results") {
                every {
                    mongoTemplate.find(Query(Criteria.where("questId").`is`("fake")), Solution::class.java)
                } returns fluxOf()

                val results = runBlocking { repository.findSolutionsByQuestId("fake").asFlow().toList() }

                results.isEmpty() shouldBe true
            }
        }

        context("Update solution") {
            it("should update result") {
                val newResult = ExecutionResult.Accepted(listOf("ok"), 0)
                val updated = newSolution1.copy(result = newResult)

                every {
                    mongoTemplate.findAndModify(
                        any<Query>(),
                        any(),
                        any<FindAndModifyOptions>(),
                        Solution::class.java
                    )
                } returns monoOf(updated)

                val modified = runBlocking { repository.updateResult(id1, newResult).awaitSingle() }

                modified.result shouldBe newResult
            }

            it("should return null if solution does not exist") {
                every {
                    mongoTemplate.findAndModify(
                        any<Query>(),
                        any(),
                        any<FindAndModifyOptions>(),
                        Solution::class.java
                    )
                } returns monoOf(null)

                val modified = runBlocking { repository.updateResult(id1, ExecutionResult.Pending).awaitSingleOrNull() }

                modified shouldBe null
            }
        }

        context("Delete solution") {
            it("should delete by id") {
                every { mongoTemplate.findAndRemove(any(), Solution::class.java) } returns monoOf(newSolution1)

                val deleted = runBlocking { repository.removeSolutionById(id1).awaitSingle() }

                deleted shouldBe newSolution1
            }

            it("should return null if id not found") {
                every { mongoTemplate.findAndRemove(any(), Solution::class.java) } returns monoOf(null)

                val deleted = runBlocking { repository.removeSolutionById(id1).awaitSingleOrNull() }

                deleted shouldBe null
            }
        }
    }
})

