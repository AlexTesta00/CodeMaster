package com.codemaster.solutionservice.interfaces

import codemaster.servicies.solution.Application
import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import io.kotest.common.runBlocking
import io.kotest.core.spec.style.DescribeSpec
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import codemaster.servicies.solution.domain.dto.SolutionsDTO.*
import codemaster.servicies.solution.infrastructure.SolutionRepositoryImpl
import codemaster.servicies.solution.infrastructure.docker.DockerRunner
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.StateID
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.extensions.spring.SpringExtension
import io.mockk.coEvery
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient
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
import java.nio.file.Path
import java.nio.file.Paths

@ContextConfiguration(classes = [Application::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles("test")
class ApiTest @Autowired constructor(
    private val webTestClient: WebTestClient,
    private val runner: DockerRunner
) : DescribeSpec() {

    @Autowired
    private lateinit var propertyResolver: PropertyResolver

    override fun extensions() = listOf(SpringExtension)

    private lateinit var mongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: SolutionRepositoryImpl
    private lateinit var service: SolutionService

    val user = "user"
    val questId = "test"
    val language = Language("Java", ".java")
    val languageDTO = LanguageDTORequest(language.name, language.fileExtension)
    val notSolved = false
    val testCode =
        """
            @Test
            void testFunction1() {
                assertEquals("Hello World! test", Main.myPrint("test"));
            }
        """.trimIndent()
    val code =
        """
            static String myPrint(String s) {
                return "Hello World! " + s;
            }
        """.trimIndent()

    val codes = mutableListOf<Code>(
        Code(
            language = language,
            code = code
        )
    )

    val codesDTO = listOf(
        CodeDTORequest(
            languageDTO,
            code
        )
    )

    val solutionDTORequest = SolutionDTORequest(
        user,
        questId,
        notSolved,
        codesDTO
    )

    val baseUrl = "/api/v1/solutions"

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
            repository = SolutionRepositoryImpl(mongoTemplate)
            service = SolutionService(repository, runner)
        }

        afterEach {
            runBlocking {
                mongoTemplate.remove(Query(), Solution::class.java).awaitSingleOrNull()
            }
        }

        describe("POST /api/v1/solutions/") {

            it("should add new solution correctly") {

                val bodyContent = webTestClient.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(solutionDTORequest)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()

                bodyContent.jsonPath("$.user").isEqualTo(user)
                    .jsonPath("$.questId").isEqualTo(questId)
                    .jsonPath("$.codes[0].code").isEqualTo(code)
                    .jsonPath("$.codes[0].language.name").isEqualTo(language.name)
            }

            it("should return 400 if language params are empty") {
                val invalidLanguage = LanguageDTORequest("", "")
                val invalidCodes = listOf<CodeDTORequest>(
                    CodeDTORequest(
                        invalidLanguage,
                        code
                    )
                )
                val invalidRequest = SolutionDTORequest(
                    user,
                    questId,
                    notSolved,
                    invalidCodes
                )

                webTestClient.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(invalidRequest)
                    .exchange()
                    .expectStatus().isBadRequest
            }
        }

        describe("GET /api/v1/solutions/{id}") {

            var newId: String = ""

            beforeTest {
                webTestClient.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(solutionDTORequest)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.id").value<String> { id ->
                        println("Generated Solution ID: $id")
                        newId = id
                    }
            }

            it("should return a solution by id") {

                webTestClient.get()
                    .uri("$baseUrl/$newId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.user").isEqualTo(user)
                    .jsonPath("$.questId").isEqualTo(questId)
                    .jsonPath("$.codes[0].code").isEqualTo(code)
                    .jsonPath("$.codes[0].language.name").isEqualTo(language.name)
            }

            it("should return 404 if not found") {
                val fakeId = SolutionId.generate()

                webTestClient.get()
                    .uri("$baseUrl/$fakeId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isNotFound
            }
        }

        describe("GET /api/v1/solutions/codequests/{questId}") {

            var newId = ""

            beforeTest {
                webTestClient.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(solutionDTORequest)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.id").value<String> { id ->
                        println("Generated Solution ID: $id")
                        newId = id
                    }
            }

            it("should return all solutions for the given codequest id") {

                webTestClient.get()
                    .uri("$baseUrl/codequests/$questId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.size()").isEqualTo(4)
                    .jsonPath("$[0].user").isEqualTo(user)
                    .jsonPath("$[0].questId").isEqualTo(questId)
                    .jsonPath("$.[0].codes[0].code").isEqualTo(code)
                    .jsonPath("$.[0].codes[0].language.name").isEqualTo(language.name)
            }
        }

        describe("GET /api/v1/solutions/solved/{user}") {

            beforeTest {
                webTestClient.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(SolutionDTORequest(
                        user,
                        questId,
                        true,
                        codesDTO
                    ))
                    .exchange()
            }

            it("should find all solved solutions by a user") {

                webTestClient.get()
                    .uri { uriBuilder ->
                        uriBuilder.path("$baseUrl/solved/$user")
                            .build()
                    }
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.size()").isEqualTo(1)
                    .jsonPath("$[0].user").isEqualTo(user)
                    .jsonPath("$[0].solved").isEqualTo(true)
            }
        }

        describe("GET /api/v1/solutions/users/{user}") {

            beforeTest {
                webTestClient.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(solutionDTORequest)
                    .exchange()
            }

            it("should find all solutions submitted by a user") {
                webTestClient.get()
                    .uri { uriBuilder ->
                        uriBuilder.path("$baseUrl/users/$user")
                            .build()
                    }
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.size()").isEqualTo(6)
                    .jsonPath("$[0].user").isEqualTo(user)
                    .jsonPath("$[0].solved").isEqualTo(false)
            }
        }

        describe("DELETE /api/v1/solutions/id={id}") {

            var newId = ""

            beforeTest {
                webTestClient.post()
                    .uri("$baseUrl/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(solutionDTORequest)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.id").value<String> { id ->
                        println("Generated Solution ID: $id")
                        newId = id
                    }
            }

            it("should delete the solution correctly") {

                webTestClient.delete()
                    .uri("$baseUrl/$newId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isOk
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(newId)

                webTestClient.get()
                    .uri("$baseUrl/$newId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isNotFound
            }

            it("should return 404 if there is no solution with given id") {
                val fakeId = SolutionId.generate()

                webTestClient.delete()
                    .uri("$baseUrl/$fakeId")
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange()
                    .expectStatus().isNotFound
            }
        }
    }
}
