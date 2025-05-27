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
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
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
    private val javaLanguage = Language("Java", ".java")
    private val testCode =
        """
            @Test
            void testFunction1() {
                assertEquals("Hello World! test", Main.myPrint("test"));
            }
            
            @Test
            void testFunction2() {
                assertEquals("Hello World! test", Main.myPrint("test"));
            }
        """.trimIndent()
    private val code =
        """
            static String myPrint(String s) {
                return "Hello World! " + s;
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
            service = SolutionService(repository, System.getProperty("user.home") + "/code-run")
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
            solution.language shouldBe javaLanguage
        }

        describe("SolutionServiceTest") {

            context("Add new solution") {

                it("should save and retrieve solution correctly") {
                    val saved = service.addSolution(id1, user, questId, javaLanguage, code, testCode)

                    checkSolution(saved)
                }

                it("should throw excpetion if code is empty") {
                    shouldThrow<EmptyCodeException> {
                        service.addSolution(id1, user, questId, javaLanguage, "", testCode)
                    }
                }

                it("should throw excpetion if test code is empty") {
                    shouldThrow<EmptyCodeException> {
                        service.addSolution(id1, user, questId, javaLanguage, code, "")
                    }
                }

                it("should throw exception if username is invalid") {
                    shouldThrow<InvalidUserException> {
                        service.addSolution(id1, "", questId, javaLanguage, code, testCode)
                    }
                }
            }

            context("Find solution by id") {

                beforeTest {
                    service.addSolution(id1, user, questId, javaLanguage, code, testCode)
                    service.addSolution(id2, user, questId, javaLanguage, code, testCode)
                }

                it("should retrieve solution by his id") {
                    val founded = service.getSolution(id1)

                    founded shouldNotBe null
                    checkSolution(founded)
                }

                it("should retrieve al solutions with the same questId") {
                    val list = service.getSolutionsByQuestId(questId)

                    list.size shouldBe 2
                    checkSolution(list.first())

                    list.last().id shouldBe id2
                    list.last().code shouldBe code
                    list.last().questId shouldBe questId
                    list.last().result shouldBe ExecutionResult.Pending
                    list.last().language shouldBe javaLanguage
                }

                it("should retrieve al solutions with the same user name") {
                    val list = service.getSolutionsByLanguage(javaLanguage)

                    list.size shouldBe 2
                    checkSolution(list.first())

                    list.last().id shouldBe id2
                    list.last().code shouldBe code
                    list.last().language shouldBe javaLanguage
                    list.last().result shouldBe ExecutionResult.Pending
                    list.last().questId shouldBe questId
                }

                it("should throw exception if there is no solution with given id") {
                    val fakeId = SolutionId.generate()

                    shouldThrow<NoSuchElementException> {
                        service.getSolution(fakeId)
                    }
                }

                it("should be empty if there are no solutions with given questId") {
                    val fakeQuestId = "fake"

                    service.getSolutionsByQuestId(fakeQuestId).isEmpty() shouldBe true
                }

                it("should be empty if there are no solutions with given language") {
                    val fakeLanguage = Language("Scala", ".scala")

                    service.getSolutionsByLanguage(fakeLanguage).isEmpty() shouldBe true
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

            beforeTest {
                service.addSolution(id1, user, questId, javaLanguage, code, testCode)
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
            }
        }

        describe("Delete solution") {

            beforeTest {
                service.addSolution(id1, user, questId, javaLanguage, code, testCode)
            }

            it("should delete solution correctly by id") {
                service.deleteSolution(id1)

                shouldThrow<NoSuchElementException> {
                    service.getSolution(id1)
                }
            }

            it("should throw exception if there is no solution with given id") {
                val fakeId = SolutionId.generate()

                shouldThrow<NoSuchElementException> {
                    service.deleteSolution(fakeId)
                }
            }
        }

        context("Compile and execute solution code") {
            val nonCompilingCode = """
                static String myPrint(String s) {
                    return s;
                
            """.trimIndent()

            val loop = """
                static Void myPrint(String s) {
                    while(true) {}
                }
                """.trimIndent()

            val failingTestCode =
                """
                @Test
                void testFunction1() {
                    assertEquals("test", Main.myPrint(null));
                }
            """.trimIndent()

            beforeTest {
                service.addSolution(id1, user, questId, javaLanguage, code, testCode)
            }

            it("should return the correct result") {
                val solution = service.executeSolution(id1)
                val output = listOf("testFunction1() [OK]", "testFunction2() [OK]")

                solution.result shouldBe ExecutionResult.Accepted(output, 0)
            }

            it("should fail if the compile is not successful") {
                val newId = SolutionId.generate()
                val failingSolution = SolutionFactoryImpl().create(
                    newId,
                    user,
                    questId,
                    javaLanguage,
                    nonCompilingCode,
                    testCode
                )
                repository.addNewSolution(failingSolution).awaitSingleOrNull()
                val solution = service.executeSolution(newId)

                println(solution.result.toString())
                solution.result.shouldBeTypeOf<ExecutionResult.Failed>().also {
                    it.error shouldBe "Non-zero exit code"
                    it.exitCode shouldBe 1
                    it.stderr shouldContain "error: reached end of file while parsing"
                    it.stderr shouldContain "Main.java"
                }
            }

            it("should fail if there is a runtime exception") {
                val newId = SolutionId.generate()
                val newCode =
                    """
                    static String myPrint(String input) {
                        return input.toUpperCase();
                    }
                """.trimIndent()

                val failingSolution = SolutionFactoryImpl().create(
                    newId,
                    user,
                    questId,
                    javaLanguage,
                    newCode,
                    failingTestCode
                )
                repository.addNewSolution(failingSolution).awaitSingleOrNull()
                val solution = service.executeSolution(newId)

                solution.result.shouldBeTypeOf<ExecutionResult.Failed>().also {
                    it.error shouldBe "Non-zero exit code"
                    it.exitCode shouldBe 1
                    it.stderr shouldContain "NullPointerException"
                    it.stderr shouldContain "Main.myPrint"
                }
            }

            it("should exceed timeout if computation is too heavy") {
                val newId = SolutionId.generate()
                val loopSolution = SolutionFactoryImpl().create(
                    newId,
                    user,
                    questId,
                    javaLanguage,
                    loop,
                    testCode
                )
                repository.addNewSolution(loopSolution).awaitSingleOrNull()
                val solution = service.executeSolution(newId)

                solution.result shouldBe ExecutionResult.TimeLimitExceeded(20_000)
            }

            it("should throw exception if there is no solution with given id") {
                val fakeId = SolutionId.generate()

                shouldThrow<NoSuchElementException> {
                    service.executeSolution(fakeId)
                }
            }
        }
    }
}
