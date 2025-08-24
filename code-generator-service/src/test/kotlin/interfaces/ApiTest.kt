package interfaces

import codemaster.services.generator.Application
import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionParameter
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.TypeName
import codemaster.services.generator.interfaces.dto.ExampleCaseDto
import codemaster.services.generator.interfaces.dto.FunctionParameterDto
import codemaster.services.generator.interfaces.dto.GenerateRequestDto
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.StateID
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.extensions.spring.SpringExtension
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.env.PropertyResolver
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.SimpleReactiveMongoDatabaseFactory
import org.springframework.data.mongodb.core.convert.MappingMongoConverter
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver
import org.springframework.data.mongodb.core.mapping.MongoMappingContext
import org.springframework.data.mongodb.core.mapping.MongoSimpleTypes
import org.springframework.data.mongodb.core.query.Query
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.reactive.server.WebTestClient

@ContextConfiguration(classes = [Application::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles("test")
class ApiTest : DescribeSpec() {

    @Autowired
    private lateinit var propertyResolver: PropertyResolver

    @Autowired
    lateinit var webTestClient: WebTestClient

    override fun extensions() = listOf(SpringExtension)

    lateinit var mongoTemplate: ReactiveMongoTemplate

    val questId = "test-quest"
    val baseUrl = "/api/v1/code-generator"

    val request = GenerateRequestDto(
        questId = questId,
        functionName = "foo",
        parameters = listOf(FunctionParameterDto(name = "x", typeName = "Map<string, string>")),
        returnType = "Map<int, int>",
        examples = listOf(
            ExampleCaseDto(inputs = listOf("{si:no}"), output = "{2:1}")
        ),
        languages = listOf("Kotlin", "Java")
    )

    companion object {
        lateinit var mongoProcess: TransitionWalker.ReachedState<RunningMongodProcess>

        @JvmStatic
        @DynamicPropertySource
        fun registerMongoProperties(registry: DynamicPropertyRegistry) {
            mongoProcess = Mongod.instance()
                .transitions(Version.Main.V6_0)
                .walker()
                .initState(StateID.of(RunningMongodProcess::class.java))

            val port = mongoProcess.current().serverAddress.port
            val mongoUri = "mongodb://localhost:$port"

            registry.add("spring.data.mongodb.uri") { mongoUri }
            registry.add("spring.rabbitmq.host") { "localhost" }  // o mocka
        }
    }

    init {
        beforeTest {

            val client = MongoClients.create(propertyResolver.getProperty("spring.data.mongodb.uri")
                ?: "mongodb://localhost:27017/codemaster")
            val factory = SimpleReactiveMongoDatabaseFactory(client, "test")

            val mappingContext = MongoMappingContext().apply {
                setSimpleTypeHolder(MongoSimpleTypes.HOLDER)
                afterPropertiesSet()
            }

            val converter = MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext).apply {
                afterPropertiesSet()
            }

            mongoTemplate = ReactiveMongoTemplate(factory, converter)
        }

        afterEach {
            runBlocking {
                mongoTemplate.remove(Query(), CodeQuestCode::class.java).awaitSingleOrNull()
            }
        }

        describe("POST /code-generator/generate") {
            it("should generate code for a codequest") {
                webTestClient.post()
                    .uri("$baseUrl/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.questId").isEqualTo(questId)
            }
        }

        describe("GET /code-generator/{questId}") {

            beforeTest {
                webTestClient.post()
                    .uri("$baseUrl/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.questId").isEqualTo(questId)
            }

            it("should retrieve the generated codequest code") {

                webTestClient.get()
                    .uri("$baseUrl/$questId")
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.questId").isEqualTo(questId)
            }
        }
    }
}
