package com.codemaster.solutionservice.repository

import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepositoryImpl
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.embed.process.io.ProcessOutput
import de.flapdoodle.reverse.TransitionWalker
import de.flapdoodle.reverse.transitions.Start
import io.kotest.assertions.throwables.shouldThrowAny
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.bson.types.ObjectId
import org.junit.jupiter.api.TestInstance
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.SimpleReactiveMongoDatabaseFactory
import org.springframework.data.mongodb.core.convert.MappingMongoConverter
import org.springframework.data.mongodb.core.convert.MongoCustomConversions
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver
import org.springframework.data.mongodb.core.mapping.MongoMappingContext
import org.springframework.data.mongodb.core.mapping.MongoSimpleTypes
import org.springframework.data.mongodb.core.query.Query

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SolutionRepositoryTest : DescribeSpec() {
    init {

        lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
        lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
        lateinit var repository: SolutionRepositoryImpl

        val id = SolutionId.generate()
        val user = "user"
        val questId = ObjectId()
        val language = Language("Java", ".java", "21", "jvm")
        val code =
            """
            class Solution {
                public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
                    // ...
                }
            }
            """.trimIndent()

        val newSolution = SolutionFactoryImpl().create(id, user, questId, language, code)

        beforeSpec {
            val mongodb = object : Mongod() {
                override fun processOutput(): Start<ProcessOutput> {
                    return Start.to(ProcessOutput::class.java)
                        .initializedWith(ProcessOutput.silent())
                        .withTransitionLabel("no output")
                }
            }
            mongodProcess = mongodb.start(Version.Main.V6_0)
            val port = mongodProcess.current().serverAddress.port

            val connectionString = "mongodb://localhost:$port"
            val client = MongoClients.create(connectionString)
            val factory = SimpleReactiveMongoDatabaseFactory(client, "test")

            val mappingContext = MongoMappingContext()
            mappingContext.setSimpleTypeHolder(MongoSimpleTypes.HOLDER)
            mappingContext.afterPropertiesSet()

            val customConversions =
                MongoCustomConversions(
                    listOf(
                        SolutionIdWriter(),
                        SolutionIdReader(),
                    ),
                )

            val converter =
                MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext).apply {
                    setCustomConversions(customConversions)
                    afterPropertiesSet()
                }

            reactiveMongoTemplate = ReactiveMongoTemplate(factory, converter)

            repository = SolutionRepositoryImpl(reactiveMongoTemplate)
        }

        afterSpec {
            mongodProcess.close()
        }

        afterEach {
            runBlocking {
                reactiveMongoTemplate.remove(Query(), Solution::class.java).awaitSingleOrNull()
            }
        }

        fun checkSolution(solution: Solution) {
            solution.id shouldBe id
            solution.code shouldBe code
            solution.result shouldBe ExecutionResult.Pending
            solution.questId shouldBe questId
            solution.language shouldBe language
        }

        describe("SolutionRepositoryTest") {

            context("Add new solution") {
                it("should save and retieve solution correctly") {
                    val saved = repository.addNewSolution(newSolution).awaitSingle()

                    checkSolution(saved)
                }
            }

            context("Find solution by id") {
                beforeTest {
                    repository.addNewSolution(newSolution).awaitSingleOrNull()
                }

                it("should retrieve solution by his id") {
                    val allSolutions =
                        reactiveMongoTemplate
                            .findAll(Solution::class.java)
                            .collectList()
                            .awaitSingleOrNull()
                    println(allSolutions)
                    val founded = repository.findSolutionById(id).awaitSingleOrNull()
                    founded shouldNotBe null
                    checkSolution(founded!!)
                }

                it("should throw exception if there is no solution with given id") {
                    val fakeId = SolutionId.generate()

                    shouldThrowAny {
                        repository.findSolutionById(fakeId).awaitSingle()
                    }
                }
            }

            context("Update solution") {
                beforeTest {
                    repository.addNewSolution(newSolution).awaitSingleOrNull()
                }

                it("should update the language correctly") {
                    val newLanguage = Language("Scala", ".scala", "3.3.4", "jvm")

                    val modified = repository.updateLanguage(id, newLanguage).awaitSingleOrNull()

                    modified shouldNotBe null
                    modified!!.language shouldBe newLanguage
                }

                it("should update the code correctly") {
                    val newCode =
                        """
                        class Solution {
                            public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
                                l2.append(l2)
                            }
                        }
                        """.trimIndent()

                    val modified = repository.updateCode(id, newCode).awaitSingleOrNull()

                    modified shouldNotBe null
                    modified!!.code shouldBe newCode
                }

                it("should update the result correctly") {
                    val newResult = ExecutionResult.Accepted

                    val modified = repository.updateResult(id, newResult).awaitSingleOrNull()

                    modified shouldNotBe null
                    modified!!.result shouldBe newResult
                }

                it("should fail if the solution with given id does not exist in the database") {
                    val fakeId = SolutionId.generate()
                    val newLanguage = Language("Scala", ".scala", "3.3.4", "jvm")
                    val newResult = ExecutionResult.Accepted
                    val newCode =
                        """
                        class Solution {
                            public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
                                l2.append(l2)
                            }
                        }
                        """.trimIndent()

                    repository.updateResult(fakeId, newResult).awaitSingleOrNull() shouldBe null
                    repository.updateCode(fakeId, newCode).awaitSingleOrNull() shouldBe null
                    repository.updateLanguage(fakeId, newLanguage).awaitSingleOrNull() shouldBe null
                }
            }

            context("Delete solution") {
                beforeTest {
                    repository.addNewSolution(newSolution).awaitSingleOrNull()
                }
                it("should delete the solution by id correctly") {
                    val deleted = repository.removeSolutionById(id).awaitSingleOrNull()

                    deleted shouldNotBe null
                    repository.findSolutionById(deleted!!.id).awaitSingleOrNull() shouldBe null
                }
                it("should fail if the solution with given id does not exist in the database") {
                    val fakeId = SolutionId.generate()

                    repository.removeSolutionById(fakeId).awaitSingleOrNull() shouldBe null
                }
            }
        }
    }
}
