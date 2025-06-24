package com.codemaster.solutionservice.service

import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.infrastructure.SolutionRepositoryImpl
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
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
class KotlinExecutionServiceTest : DescribeSpec() {

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private var startedEmbeddedMongo = false
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: SolutionRepositoryImpl
    private lateinit var service: SolutionService

    private val id = SolutionId.generate()
    private val user = "user"
    private val questId = "test"
    private val kotlinLanguage = Language("Kotlin", ".kt")
    private val notSolved = false
    val testCode = """
        @Test
        fun testFunction1() {
            assertEquals("Hello World! test", Main.myPrint("test"));
        }

        @Test
        fun testFunction2() {
            assertEquals("Hello World! test", Main.myPrint("test"));
        }
    """.trimIndent()
    private val code =
        """
        companion object {
            @JvmStatic
            fun myPrint(s: String): String {
                return "Hello World! " + s
            }
        }
        """.trimIndent()

    private val codes = listOf<Code>(
        Code(
            language = kotlinLanguage,
            code = code
        )
    )

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

        describe("KotlinSolutionServiceTest") {

            context("Compile and execute solution code") {
                val nonCompilingCode = """
                    companion object {
                        @JvmStatic
                        fun myPrint(s: String): String {
                            return "Hello World! " + s
                        
                    }
                """.trimIndent()

                val loop = """
                    companion object {
                        @JvmStatic
                        fun myPrint(s: String) {
                            while(true) {}
                        }
                       }
                """.trimIndent()

                val failingTests = """
                    @Test
                    fun testFunction1() {
                        assertEquals("Hello World! test", Main.myPrint("test"));
                    }
        
                    @Test
                    fun testFunction2() {
                        assertEquals("Hello World! test", Main.myPrint(""));
                    }
                """.trimIndent()

                val runtimeException = """
                    @Test
                    fun testFunction1() {
                        assertEquals("Hello World! test", Main.myPrint(null));
                    }
                """.trimIndent()

                beforeTest {
                    service.addSolution(id, user, questId, notSolved, codes)
                }

                it("should compile code successfully") {
                    val result = service.compileSolution(id, kotlinLanguage, code, testCode)
                    val output = emptyList<String>()

                    result shouldBe ExecutionResult.Accepted(output, 0)
                }

                it("should execute code and return all test function passed") {
                    val solution = service.executeSolution(id, kotlinLanguage, code, testCode)
                    val output = listOf("testFunction1() [OK]", "testFunction2() [OK]")

                    solution.result shouldBe ExecutionResult.Accepted(output, 0)
                    solution.solved shouldBe true
                }

                it("should execute code and return some test function failed") {
                    val solution = service.executeSolution(id, kotlinLanguage, code, failingTests)
                    val output = listOf(
                        "testFunction1() [OK]",
                        "testFunction2() [X] expected: <Hello World! test> but was: <Hello World! >"
                    )

                    solution.result.shouldBeTypeOf<ExecutionResult.TestsFailed>().also {
                        it.error shouldContain "Tests failed"
                        it.exitCode shouldBe 1
                        it.output shouldBe output
                    }
                    solution.solved shouldBe false
                }

                it("should fail if the compilation is not successful") {
                    val result = service.compileSolution(id, kotlinLanguage, nonCompilingCode, testCode)

                    result.shouldBeTypeOf<ExecutionResult.CompileFailed>().also {
                        it.error shouldContain "Compilation failed"
                        it.exitCode shouldBe 1
                        it.stderr shouldContain "error: missing '}"
                        it.stderr shouldContain "Main.kt"
                    }
                }

                it("should fail execution if there is a runtime exception") {
                    val newId = SolutionId.generate()
                    val newCode = """
                        companion object {
                            @JvmStatic
                            fun myPrint(input: String?): String {
                                return input!!.toUpperCase();
                            }
                        }
                    """.trimIndent()


                    val failingSolution = SolutionFactoryImpl().create(
                        newId,
                        user,
                        questId,
                        notSolved,
                        codes
                    )
                    repository.addNewSolution(failingSolution).awaitSingleOrNull()
                    val solution = service.executeSolution(id, kotlinLanguage, newCode, runtimeException)
                    val output = listOf(
                        "testFunction1() [X] java.lang.NullPointerException"
                    )

                    solution.result.shouldBeTypeOf<ExecutionResult.TestsFailed>().also {
                        it.error shouldContain "Tests failed"
                        it.exitCode shouldBe 1
                        it.output shouldBe output
                    }
                }

                it("should exceed timeout if execution is too heavy") {
                    val solution = service.executeSolution(id, kotlinLanguage, loop, testCode)

                    solution.result shouldBe ExecutionResult.TimeLimitExceeded(20_000)
                }

                it("should throw exception if there is no solution with given id") {
                    val fakeId = SolutionId.generate()

                    shouldThrow<NoSuchElementException> {
                        service.executeSolution(fakeId, kotlinLanguage, code, testCode)
                    }
                    shouldThrow<NoSuchElementException> {
                        service.compileSolution(fakeId, kotlinLanguage, code, testCode)
                    }
                }
            }
        }
    }
}
