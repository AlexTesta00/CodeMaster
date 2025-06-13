package com.codemaster.solutionservice.service

import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.errors.EmptyCodeException
import codemaster.servicies.solution.domain.errors.InvalidUserException
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepositoryImpl
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.types.shouldBeInstanceOf
import io.kotest.matchers.types.shouldBeTypeOf
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
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
class SolutionServiceTest : DescribeSpec() {

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private var startedEmbeddedMongo = false
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: SolutionRepositoryImpl
    private lateinit var service: SolutionService

    private val id1 = SolutionId.generate()
    private val id2 = SolutionId.generate()
    private val user = "user"
    private val questId = "test"
    private val language = Language("Kotlin", ".kt")
    private val medium = Difficulty.Medium
    private val easy = Difficulty.Easy
    private val notSolved = false
    private val solved = true
    private val testCode =
        """
            @Test
            fun testFunction1() {
                assertEquals("Hello World! test", Main.myPrint("test"))
            }
        
            @Test
            fun testFunction2() {
                assertEquals("Hello World! test", Main.myPrint("test"))
            }
        """.trimIndent()
    private val code =
        """
        companion object {
            @JvmStatic
            fun myPrint(s: String?): String {
                return "Hello World! " + s
            }
        }
        """.trimIndent()

    init {
        beforeSpec {
            val mongoUri = System.getenv("MONGO_URI")
            val connectionString = mongoUri ?: "mongodb://localhost:27017/codemaster"

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
            service = SolutionService(repository)
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
            solution.result.shouldBeInstanceOf<ExecutionResult.Pending>()
            solution.questId shouldBe questId
            solution.language shouldBe language
        }

        describe("SolutionServiceTest") {

            context("Add new solution") {

                it("should save and retrieve solution correctly") {
                    val saved = service.addSolution(id1, user, questId, language, medium, notSolved, code, testCode)

                    checkSolution(saved)
                }

                it("should throw exception if code is empty") {
                    shouldThrow<EmptyCodeException> {
                        service.addSolution(id1, user, questId, language, medium, notSolved,"", testCode)
                    }
                }

                it("should throw exception if test code is empty") {
                    shouldThrow<EmptyCodeException> {
                        service.addSolution(id1, user, questId, language, medium, notSolved, code, "")
                    }
                }

                it("should throw exception if username is invalid") {
                    shouldThrow<InvalidUserException> {
                        service.addSolution(id1, "", questId, language, medium, notSolved, code, testCode)
                    }
                }
            }

            context("Find solution") {

                beforeTest {
                    service.addSolution(id1, user, questId, language, medium, notSolved, code, testCode)
                    service.addSolution(id2, user, questId, language, easy, solved, code, testCode)
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
                    list.last().code shouldBe code
                    list.last().questId shouldBe questId
                    list.last().result.shouldBeInstanceOf<ExecutionResult.Pending>()
                    list.last().language shouldBe language
                }

                it("should retrieve all solutions with the same user name") {
                    val list = service.getSolutionsByLanguage(language, questId)

                    list.size shouldBe 2
                    checkSolution(list.first())

                    list.last().id shouldBe id2
                    list.last().code shouldBe code
                    list.last().language shouldBe language
                    list.last().result.shouldBeInstanceOf<ExecutionResult.Pending>()
                    list.last().questId shouldBe questId
                }

                it("should retrieve all solutions solved by a user") {
                    val list = service.getSolvedSolutionsByUser(user)

                    list.size shouldBe 1

                    list.last().id shouldBe id2
                    list.last().solved shouldBe true
                    list.last().user shouldBe user
                }

                it("should retrieve all solutions solved by user with given difficulty") {
                    val list = service.getSolutionsByUserAndDifficulty(user, easy)

                    list.size shouldBe 1

                    list.last().id shouldBe id2
                    list.last().solved shouldBe true
                    list.last().user shouldBe user
                    list.last().difficulty shouldBe easy
                }

                it("should retrieve all solutions submitted by a user") {
                    val list = service.getSolutionsByUser(user)

                    list.size shouldBe 2
                    checkSolution(list.first())

                    list.last().id shouldBe id2
                    list.last().user shouldBe user
                    list.last().code shouldBe code
                    list.last().language shouldBe language
                    list.last().result.shouldBeInstanceOf<ExecutionResult.Pending>()
                    list.last().questId shouldBe questId
                }

                it("should throw exception if there is no solution with given id") {
                    val fakeId = SolutionId.generate()

                    shouldThrow<NoSuchElementException> {
                        service.getSolution(fakeId)
                    }
                }

                it("should be empty if there are no solutions with given questId") {
                    val fakeQuestId = "fakeId"

                    service.getSolutionsByQuestId(fakeQuestId).isEmpty() shouldBe true
                }

                it("should be empty if there are no solutions with given language") {
                    val fakeLanguage = Language("Scala", ".scala")

                    service.getSolutionsByLanguage(fakeLanguage, questId).isEmpty() shouldBe true
                }

                it("should be empty if there are no solutions by language of given codequest") {
                    val fakeQuestId = "fakeId"

                    service.getSolutionsByLanguage(language, fakeQuestId).isEmpty() shouldBe true
                }
            }
        }

        describe("Modify solution") {

            val fakeId = SolutionId.generate()
            val newLanguage = Language("Scala", ".scala")
            val newTestCode = """
                        @Test
                        void testFunction1() {
                            assertEquals("Hello World! new test", Main.myPrint("new test"));
                        }
                    """.trimIndent()
            val newCode = """
                        private String print(String s) {
                            return s;
                        }
                    """.trimIndent()
            val newDifficulty = Difficulty.Easy

            beforeTest {
                service.addSolution(id1, user, questId, language, medium, notSolved, code, testCode)
            }

            it("should modify solution language correctly") {
                val modifiedSolution = service.modifySolutionLanguage(id1, newLanguage)

                modifiedSolution.id shouldBe id1
                modifiedSolution.language shouldBe newLanguage
            }

            it("should modify solution code correctly") {
                val modifiedSolution = service.modifySolutionCode(id1, newCode)

                modifiedSolution.id shouldBe id1
                modifiedSolution.code shouldBe newCode
            }

            it("should modify solution test code correctly") {
                val modifiedSolution = service.modifySolutionTestCode(id1, newTestCode)

                modifiedSolution.id shouldBe id1
                modifiedSolution.testCode shouldBe newTestCode
            }

            it("should modify solution difficulty correctly") {
                val modifiedSolution = service.modifySolutionDifficulty(id1, newDifficulty)

                modifiedSolution.id shouldBe id1
                modifiedSolution.difficulty shouldBe newDifficulty
            }

            it("should throw exception if there is no solution with given id") {
                shouldThrow<NoSuchElementException> {
                    service.modifySolutionLanguage(fakeId, newLanguage)
                }
                shouldThrow<NoSuchElementException> {
                    service.modifySolutionCode(fakeId, newCode)
                }
                shouldThrow<NoSuchElementException> {
                    service.modifySolutionTestCode(fakeId, newTestCode)
                }
                shouldThrow<NoSuchElementException> {
                    service.modifySolutionDifficulty(fakeId, newDifficulty)
                }
            }
        }

        describe("Delete solution") {

            beforeTest {
                service.addSolution(id1, user, questId, language, medium, notSolved, code, testCode)
            }

            it("should delete solution correctly by id") {
                service.deleteSolution(id1)

                shouldThrow<NoSuchElementException> {
                    service.getSolution(id1)
                }
            }

            it("should delete all solutions created by a user") {
                service
            }

            it("should throw exception if there is no solution with given id") {
                val fakeId = SolutionId.generate()

                shouldThrow<NoSuchElementException> {
                    service.deleteSolution(fakeId)
                }
            }
        }
    }
}
