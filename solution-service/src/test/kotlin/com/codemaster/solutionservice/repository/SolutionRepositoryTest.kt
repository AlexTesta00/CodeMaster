package com.codemaster.solutionservice.repository

import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepositoryImpl
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.StateID
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.assertions.throwables.shouldThrowAny
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import kotlinx.coroutines.reactive.awaitSingle
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

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private var startedEmbeddedMongo = false
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: SolutionRepositoryImpl

    private val id1 = SolutionId.generate()
    private val id2 = SolutionId.generate()
    private val user = "user"
    private val questId = ObjectId()
    private val language = Language("Java", ".java", "21", "jvm")
    private val code =
        """
        class Solution {
            public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
                // ...
            }
        }
        """.trimIndent()

    private val newSolution1 = SolutionFactoryImpl().create(id1, user, questId, language, code)
    private val newSolution2 = SolutionFactoryImpl().create(id2, user, questId, language, code)

    init {
        beforeSpec {
            val mongoUri = System.getenv("MONGO_URI")
            val connectionString = mongoUri ?: run {
                val transitions = Mongod.instance().transitions(Version.Main.V6_0)
                mongodProcess = transitions.walker().initState(StateID.of(RunningMongodProcess::class.java))
                startedEmbeddedMongo = true
                "mongodb://localhost:${mongodProcess.current().serverAddress.port}"
            }

            val client = MongoClients.create(connectionString)
            val factory = SimpleReactiveMongoDatabaseFactory(client, "test")

            val mappingContext = MongoMappingContext().apply {
                setSimpleTypeHolder(MongoSimpleTypes.HOLDER)
                afterPropertiesSet()
            }

            val customConversions = MongoCustomConversions(
                listOf(SolutionIdWriter(), SolutionIdReader())
            )

            val converter = MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext).apply {
                setCustomConversions(customConversions)
                afterPropertiesSet()
            }

            reactiveMongoTemplate = ReactiveMongoTemplate(factory, converter)
            repository = SolutionRepositoryImpl(reactiveMongoTemplate)
        }

        afterSpec {
            if (startedEmbeddedMongo) {
                mongodProcess.close()
            }
        }

        afterEach {
            runBlocking {
                reactiveMongoTemplate.remove(Query(), Solution::class.java).awaitSingleOrNull()
            }
        }

        fun checkSolution(solution: Solution) {
            solution.id shouldBe id1
            solution.code shouldBe code
            solution.result shouldBe ExecutionResult.Pending
            solution.questId shouldBe questId
            solution.language shouldBe language
        }

        describe("SolutionRepositoryTest") {

            context("Add new solution") {
                it("should save and retrieve solution correctly") {
                    val saved = repository.addNewSolution(newSolution1).awaitSingle()

                    checkSolution(saved)
                }
            }

            context("Find solution") {
                beforeTest {
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                    repository.addNewSolution(newSolution2).awaitSingleOrNull()
                }

                it("should retrieve solution by his id") {
                    val founded = repository.findSolutionById(id1).awaitSingleOrNull()

                    founded shouldNotBe null
                    checkSolution(founded!!)
                }

                it("should get all solutions by questId") {
                    val source = repository
                        .findSolutionsByQuestId(questId)
                        .collectList()
                        .awaitSingleOrNull()

                    source?.size shouldBe 2
                    checkSolution(source?.first()!!)

                    source.last().id shouldBe id2
                    source.last().code shouldBe code
                    source.last().result shouldBe ExecutionResult.Pending
                    source.last().questId shouldBe questId
                    source.last().language shouldBe language
                }

                it("should get all solutions by language") {
                    val source = repository
                        .findSolutionsByLanguage(language)
                        .collectList()
                        .awaitSingleOrNull()

                    source?.size shouldBe 2
                    checkSolution(source?.first()!!)

                    source.last().id shouldBe id2
                    source.last().code shouldBe code
                    source.last().result shouldBe ExecutionResult.Pending
                    source.last().questId shouldBe questId
                    source.last().language shouldBe language
                }

                it("should throw exception if there is no solution with given id") {
                    val fakeId = SolutionId.generate()

                    shouldThrowAny {
                        repository.findSolutionById(fakeId).awaitSingle()
                    }
                }

                it("should be empty if there are no solutions with given questId") {
                    val fakeQuestId = ObjectId()
                    val solutions = repository
                        .findSolutionsByQuestId(fakeQuestId)
                        .collectList()
                        .awaitSingleOrNull()

                    solutions?.isEmpty() shouldBe true
                }

                it("should be empty if there are no solutions with given language") {
                    val fakeLanguage = Language("Scala", ".scala", "3.3", "jvm")
                    val solutions = repository
                        .findSolutionsByLanguage(fakeLanguage)
                        .collectList()
                        .awaitSingleOrNull()

                    solutions?.isEmpty() shouldBe true
                }
            }

            context("Update solution") {
                beforeTest {
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                }

                it("should update the language correctly") {
                    val newLanguage = Language("Scala", ".scala", "3.3.4", "jvm")

                    val modified = repository.updateLanguage(id1, newLanguage).awaitSingleOrNull()

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

                    val modified = repository.updateCode(id1, newCode).awaitSingleOrNull()

                    modified shouldNotBe null
                    modified!!.code shouldBe newCode
                }

                it("should update the result correctly") {
                    val newResult = ExecutionResult.Accepted("[1,2,3,4]", 0)

                    val modified = repository.updateResult(id1, newResult).awaitSingleOrNull()

                    modified shouldNotBe null
                    modified!!.result shouldBe newResult
                }

                it("should fail if the solution with given id does not exist in the database") {
                    val fakeId = SolutionId.generate()
                    val newLanguage = Language("Scala", ".scala", "3.3.4", "jvm")
                    val newResult = ExecutionResult.Accepted("[1,2,3,4]", 0)
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
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                }
                it("should delete the solution by id correctly") {
                    val deleted = repository.removeSolutionById(id1).awaitSingleOrNull()

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
