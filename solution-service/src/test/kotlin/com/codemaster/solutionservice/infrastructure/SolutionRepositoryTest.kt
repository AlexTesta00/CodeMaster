package com.codemaster.solutionservice.infrastructure

import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.infrastructure.SolutionRepositoryImpl
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.StateID
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.assertions.throwables.shouldThrowAny
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
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
    private val id3 = SolutionId.generate()
    private val user = "user"
    private val questId = "test"
    private val language = Language("Java", ".java")
    private val solved = false
    private val code = Code(
        language,
        """
            static String myPrint(String s) {
                return "Hello World! " + s;
            }
        """.trimIndent()
        )
    private val codes = listOf(code)

    private val newSolution1 = SolutionFactoryImpl()
        .create(id1, user, questId, solved, codes)
    private val newSolution2 = SolutionFactoryImpl()
        .create(id2, user, questId,  solved, codes)
    private val solvedSolution = SolutionFactoryImpl()
        .create(id3, user, questId, true, codes)


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
            solution.user shouldBe user
            solution.result.shouldBeInstanceOf<ExecutionResult.Pending>()
            solution.questId shouldBe questId
            for (code in solution.codes) {
                code shouldBe code
                language shouldBe language
            }
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
                    val founded = repository.findSolutionById(id1).awaitSingle()

                    checkSolution(founded)
                }

                it("should get all solutions by questId") {
                    val source = repository
                        .findSolutionsByQuestId(questId)
                        .collectList()
                        .awaitSingle()

                    source.size shouldBe 2
                    checkSolution(source.first())

                    source.last().id shouldBe id2
                    source.last().user shouldBe user
                    source.last().result.shouldBeInstanceOf<ExecutionResult.Pending>()
                    source.last().questId shouldBe questId
                    for (code in source.last().codes) {
                        code shouldBe code
                        language shouldBe language
                    }
                }

                it("should find solved solution by author") {
                    repository.addNewSolution(solvedSolution).awaitSingleOrNull()

                    val source = repository
                        .findSolvedSolutionsByUser(user)
                        .collectList()
                        .awaitSingle()

                    source.size shouldBe 1

                    source.first().solved shouldBe true
                    source.first().id shouldBe id3
                }

                it("should find all solutions submitted by a user") {
                    val source = repository
                        .findSolutionsByUser(user)
                        .collectList()
                        .awaitSingle()

                    source.size shouldBe 2
                    checkSolution(source.first())

                    source.last().id shouldBe id2
                    source.last().user shouldBe user
                    source.last().result.shouldBeInstanceOf<ExecutionResult.Pending>()
                    source.last().questId shouldBe questId
                    for (code in source.last().codes) {
                        code shouldBe code
                        language shouldBe language
                    }
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
                        .findSolutionsByQuestId(fakeQuestId.toString())
                        .collectList()
                        .awaitSingle()

                    solutions.isEmpty() shouldBe true
                }

                it("should be empty if there are no solutions solved by a user") {
                    val fakeUser = "fakeUser"
                    val solutions = repository
                        .findSolvedSolutionsByUser(fakeUser)
                        .collectList()
                        .awaitSingle()

                    solutions.isEmpty() shouldBe true
                }

                it("should be empty if there are no solutions submitted by a user") {
                    val fakeUser = "fakeUser"
                    val solutions = repository
                        .findSolutionsByUser(fakeUser)
                        .collectList()
                        .awaitSingle()

                    solutions.isEmpty() shouldBe true
                }

            }

            context("Update solution") {
                beforeTest {
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                }

                it("should update the code correctly") {
                    val newCode = """
                        private String print(String s) {
                            return s;
                        }
                    """.trimIndent()
                    val modified = repository.updateCode(id1, newCode, language).awaitSingle()

                    modified.codes.first { it.language.name == language.name }.code shouldBe newCode
                }

                it("should update the result correctly") {
                    val newResult = ExecutionResult.Accepted(listOf("1","2","3","4"), 0)

                    val modified = repository.updateResult(id1, newResult).awaitSingle()

                    modified.result shouldBe newResult
                }

                it("should update solved correctly") {
                    val newSolved = true
                    val modified = repository.updateSolved(id1, newSolved).awaitSingle()

                    modified.solved shouldBe newSolved
                }

                it("should fail if the solution with given id does not exist in the database") {
                    val fakeId = SolutionId.generate()
                    val newResult = ExecutionResult.Accepted(listOf("1","2","3","4"), 0)
                    val newSolved = true
                    val newCode = """
                        private String print(String s) {
                            return s;
                        }
                    """.trimIndent()

                    repository.updateResult(fakeId, newResult).awaitSingleOrNull() shouldBe null
                    repository.updateCode(fakeId, newCode, language).awaitSingleOrNull() shouldBe null
                    repository.updateSolved(fakeId, newSolved).awaitSingleOrNull() shouldBe null
                }
            }

            context("Delete solution") {
                it("should delete the solution by id correctly") {
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                    val deleted = repository.removeSolutionById(id1).awaitSingle()

                    repository.findSolutionById(deleted.id).awaitSingleOrNull() shouldBe null
                }
                it("should delete all solutions created by a user") {
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                    val deletedList = repository
                        .removeSolutionsByUser(user)
                        .collectList()
                        .awaitSingle()

                    checkSolution(deletedList.first())
                }
                it("should delete all solutions of a codequests") {
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                    val deletedList = repository
                        .removeSolutionsByCodequest(questId)
                        .collectList()
                        .awaitSingle()

                    checkSolution(deletedList.first())
                }
                it("should fail if the solution with given id does not exist in the database") {
                    repository.addNewSolution(newSolution1).awaitSingleOrNull()
                    val fakeId = SolutionId.generate()

                    repository.removeSolutionById(fakeId).awaitSingleOrNull() shouldBe null
                }
            }
        }
    }
}
