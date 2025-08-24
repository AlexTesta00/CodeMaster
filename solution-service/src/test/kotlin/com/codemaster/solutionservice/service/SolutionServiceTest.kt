package com.codemaster.solutionservice.service

import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.errors.InvalidUserException
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.infrastructure.SolutionRepositoryImpl
import codemaster.servicies.solution.infrastructure.docker.DockerRunner
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.StateID
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.mockk
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

    private val runner = mockk<DockerRunner>()
    private val id1 = SolutionId.generate()
    private val id2 = SolutionId.generate()
    private val user = "user"
    private val questId = "test"
    private val language = Language("Kotlin", ".kt")
    private val notSolved = false
    private val solved = true
    private val code =
        """
        companion object {
            @JvmStatic
            fun myPrint(s: String?): String {
                return "Hello World! " + s
            }
        }
        """.trimIndent()
    private val codes = listOf<Code>(
        Code(
            language,
            code
        )
    )

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
            service = SolutionService(repository, runner)
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
                    val saved = service.addSolution(id1, user, questId, notSolved, codes)

                    checkSolution(saved)
                }

                it("should throw exception if username is invalid") {
                    shouldThrow<InvalidUserException> {
                        service.addSolution(id1, "", questId,  notSolved, codes)
                    }
                }
            }

            context("Find solution") {

                beforeTest {
                    service.addSolution(id1, user, questId, notSolved, codes)
                    service.addSolution(id2, user, questId, solved, codes)
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
                    for (cd in list.last().codes) {
                        cd.code shouldBe code
                        cd.language shouldBe language
                    }
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
                    list.last().user shouldBe user
                    list.last().result.shouldBeInstanceOf<ExecutionResult.Pending>()
                    list.last().questId shouldBe questId
                    for (cd in list.last().codes) {
                        cd.code shouldBe code
                        cd.language shouldBe language
                    }
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
            }
        }

        describe("Modify solution") {

            val fakeId = SolutionId.generate()
            val newCode = """
                        private String print(String s) {
                            return s;
                        }
                    """.trimIndent()

            beforeTest {
                service.addSolution(id1, user, questId,  notSolved, codes)
            }

            it("should modify solution code correctly") {
                val modifiedSolution = service.modifySolutionCode(id1, newCode, language)

                modifiedSolution.id shouldBe id1
                modifiedSolution.codes.first {
                    it.language == language
                }.code shouldBe newCode
            }

            it("should throw exception if there is no solution with given id") {
                shouldThrow<NoSuchElementException> {
                    service.modifySolutionCode(fakeId, newCode, language)
                }
            }
        }

        describe("Delete solution") {
            it("should delete solution correctly by id") {
                service.addSolution(id1, user, questId,  notSolved, codes)
                service.deleteSolution(id1)

                shouldThrow<NoSuchElementException> {
                    service.getSolution(id1)
                }
            }

            it("should delete all solutions created by a user") {
                service.addSolution(id1, user, questId,  notSolved, codes)
                service.deleteSolutionsByUser(user)

                service.getSolutionsByUser(user) shouldBe emptyList()
            }

            it("should delete all solutions of a codequest") {
                service.addSolution(id1, user, questId,  notSolved, codes)
                service.deleteSolutionsByCodequest(questId)

                service.getSolutionsByQuestId(questId) shouldBe emptyList()
            }

            it("should throw exception if there is no solution with given id") {
                val fakeId = SolutionId.generate()
                val fakeUser = "fakeUser"
                val fakeQuest = "fakeQuest"

                shouldThrow<NoSuchElementException> {
                    service.deleteSolution(fakeId)
                }
                service.deleteSolutionsByUser(fakeUser) shouldBe emptyList()
                service.deleteSolutionsByCodequest(fakeQuest) shouldBe emptyList()
            }
        }
    }
}
