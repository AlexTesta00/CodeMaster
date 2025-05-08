package com.codemaster.solutionservice.service

import codemaster.servicies.solution.application.ExecutionService
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepositoryImpl
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
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
class ExecutionServiceTest : DescribeSpec() {

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private var startedEmbeddedMongo = false
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: SolutionRepositoryImpl
    private lateinit var service: ExecutionService

    private val id = SolutionId.generate()
    private val user = "user"
    private val questId = ObjectId()
    private val language = Language("Java", ".java", "21", "jvm")
    private val code =
        """
        public class Main {
            public static void main(String[] args) {
                System.out.println("Hello World");
            }
        }
        """.trimIndent()

    private val nonCompilingCode =
        """
        public class Main {
            public static void main(String[] args) {
                System.out.println("Hello World");

        }
        """.trimIndent()

    private val solution = Solution(id, code, questId, user, language)

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
            service = ExecutionService(repository, System.getProperty("user.home") + "/code-run")
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

        describe("ExecutionServiceTest") {

            context("Compile and execute solution code") {

                beforeTest {
                    repository.addNewSolution(solution).awaitSingleOrNull()
                }

                it("should return the correct result") {
                    val result = service.executeSolution(id)

                    result shouldBe ExecutionResult.Accepted("Hello World", 0)
                }

                it("should fail if the compile is not successful") {
                    val newId = SolutionId.generate()
                    val failingSolution = Solution(newId, nonCompilingCode, questId, user, language)
                    repository.addNewSolution(failingSolution).awaitSingleOrNull()
                    val result = service.executeSolution(newId)

                    result shouldBe ExecutionResult.Failed(error = "Non-zero exit code",
                        "Main.java:5: error: reached end of file while parsing\n" +
                                "}\n" +
                                " ^\n" +
                                "1 error",
                        exitCode = 1)
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
}
