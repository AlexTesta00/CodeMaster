package com.codemaster.solutionservice.service

import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepositoryImpl
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
class JavaExecutionServiceTest : DescribeSpec() {

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private var startedEmbeddedMongo = false
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: SolutionRepositoryImpl
    private lateinit var service: SolutionService

    private val id = SolutionId.generate()
    private val user = "user"
    private val questId = "test"
    private val javaLanguage = Language("Java", ".java")
    private val medium = Difficulty.Medium
    private val notSolved = false
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

        describe("JavaExecutionServiceTest") {

            context("Compile and execute solution code") {
                val loop = """
                    static Void myPrint(String s) {
                        while(true) {}
                    }
                """.trimIndent()

                val failingTests = """
                    @Test
                    void testFunction1() {
                        assertEquals("Hello World! test", Main.myPrint("test"));
                    }
        
                    @Test
                    void testFunction2() {
                        assertEquals("Hello World! test", Main.myPrint(""));
                    }
                """.trimIndent()

                val runtimeException = """
                    @Test
                    void testFunction1() {
                        assertEquals("test", Main.myPrint(null));
                    }
                """.trimIndent()

                val nonCompilingCode = """
                    static String myPrint(String s) {
                        return s;
                    
                """.trimIndent()

                beforeTest {
                    service.addSolution(id, user, questId, javaLanguage, medium, notSolved, code, testCode)
                }

                it("should compile code successfully") {
                    val result = service.compileSolution(id, code)
                    val output = emptyList<String>()

                    result shouldBe ExecutionResult.Accepted(output, 0)
                }

                it("should execute code and return all test function passed") {
                    val solution = service.executeSolution(id, code)
                    val output = listOf("testFunction1() [OK]", "testFunction2() [OK]")

                    solution.result shouldBe ExecutionResult.Accepted(output, 0)
                    solution.solved shouldBe true
                }

                it("should execute code and return some test function failed") {
                    service.modifySolutionTestCode(id, failingTests)
                    val solution = service.executeSolution(id, code)
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
                    val result = service.compileSolution(id, nonCompilingCode)

                    result.shouldBeTypeOf<ExecutionResult.CompileFailed>().also {
                        it.error shouldContain "Compilation failed"
                        it.exitCode shouldBe 1
                        it.stderr shouldContain "error: reached end of file"
                        it.stderr shouldContain "Main.java"
                    }
                }

                it("should fail execution if there is a runtime exception") {
                    val newId = SolutionId.generate()
                    val newCode = """
                        static String myPrint(String input) {
                            return input.toUpperCase();
                        }
                    """.trimIndent()
                    val failingSolution = SolutionFactoryImpl().create(
                        newId,
                        user,
                        questId,
                        javaLanguage,
                        medium,
                        notSolved,
                        newCode,
                        runtimeException
                    )
                    repository.addNewSolution(failingSolution).awaitSingleOrNull()
                    val solution = service.executeSolution(newId, newCode)
                    val output = listOf(
                        "testFunction1() [X] Cannot invoke \"String.toUpperCase()\" because \"<parameter1>\" is null"
                    )

                    solution.result.shouldBeTypeOf<ExecutionResult.TestsFailed>().also {
                        it.error shouldContain "Tests failed"
                        it.exitCode shouldBe 1
                        it.output shouldBe output
                    }
                }

                it("should exceed timeout if execution is too heavy") {
                    val solution = service.executeSolution(id, loop)

                    solution.result shouldBe ExecutionResult.TimeLimitExceeded(20_000)
                }

                it("should throw exception if there is no solution with given id") {
                    val fakeId = SolutionId.generate()

                    shouldThrow<NoSuchElementException> {
                        service.executeSolution(fakeId, code)
                    }
                    shouldThrow<NoSuchElementException> {
                        service.compileSolution(fakeId, code)
                    }
                }
            }
        }
    }
}
