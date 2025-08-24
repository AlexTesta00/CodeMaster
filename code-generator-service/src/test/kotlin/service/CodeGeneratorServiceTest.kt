package service

import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionParameter
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.TypeName
import codemaster.services.generator.infrastructure.CodeQuestCodeRepository
import codemaster.services.generator.infrastructure.CodeQuestCodeRepositoryImpl
import codemaster.services.generator.service.CodeGeneratorService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Query
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.StateID
import de.flapdoodle.reverse.TransitionWalker
import org.junit.jupiter.api.TestInstance
import org.springframework.data.mongodb.core.SimpleReactiveMongoDatabaseFactory
import org.springframework.data.mongodb.core.convert.MappingMongoConverter
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver
import org.springframework.data.mongodb.core.mapping.MongoMappingContext
import org.springframework.data.mongodb.core.mapping.MongoSimpleTypes

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CodeGeneratorServiceTest : DescribeSpec() {

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: CodeQuestCodeRepository
    private lateinit var service: CodeGeneratorService

    init {

        beforeSpec {
            val transitions = Mongod.instance().transitions(Version.Main.V6_0)
            mongodProcess = transitions.walker().initState(StateID.of(RunningMongodProcess::class.java))

            val mongoUri = "mongodb://localhost:${mongodProcess.current().serverAddress.port}"
            val client = MongoClients.create(mongoUri)

            val factory = SimpleReactiveMongoDatabaseFactory(client, "test")

            val mappingContext = MongoMappingContext().apply {
                setSimpleTypeHolder(MongoSimpleTypes.HOLDER)
                afterPropertiesSet()
            }

            val converter = MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext).apply {
                afterPropertiesSet()
            }

            reactiveMongoTemplate = ReactiveMongoTemplate(factory, converter)
            repository = CodeQuestCodeRepositoryImpl(reactiveMongoTemplate)
            service = CodeGeneratorService(repository)
        }

        afterEach {
            runBlocking {
                reactiveMongoTemplate.remove(Query(), CodeQuestCode::class.java).awaitSingleOrNull()
            }
        }

        describe("CodeGeneratorServiceTest") {

            it("should generate and save quest code") {
                val signature = FunctionSignature(
                    name = "foo",
                    parameters = listOf(FunctionParameter("x", TypeName("Int"))),
                    returnType = TypeName("Map<Int,Int>")
                )
                val examples = listOf(ExampleCase(inputs = listOf(1), output = mapOf(1 to 2, 2 to 3)))
                val languages = listOf(Language.Kotlin, Language.Java)

                val codeQuestCode = service.generateQuestCode("test-quest", signature, examples, languages)

                codeQuestCode.questId shouldBe "test-quest"
                codeQuestCode.entries.map { it.language } shouldBe languages
            }

            it("should get saved quest code") {
                val signature = FunctionSignature(
                    name = "foo",
                    parameters = listOf(FunctionParameter("x", TypeName("Int"))),
                    returnType = TypeName("Int")
                )
                val examples = listOf(ExampleCase(inputs = listOf(1), output = 2))
                val languages = listOf(Language.Kotlin, Language.Java)

                service.generateQuestCode("test-quest", signature, examples, languages)

                val found = service.getQuestCode("test-quest")
                found.questId shouldBe "test-quest"
            }

            it("should throw NoSuchElementException if quest code not found on getQuestCode") {
                val exception = shouldThrow<NoSuchElementException> {
                    service.getQuestCode("nonexistent-quest")
                }
                exception.message shouldBe "Error while loading CodeQuestCode"
            }

            it("should delete quest code by questId") {
                val signature = FunctionSignature(
                    name = "foo",
                    parameters = listOf(FunctionParameter("x", TypeName("Int"))),
                    returnType = TypeName("Int")
                )
                val examples = listOf(ExampleCase(inputs = listOf(1), output = 2))
                val languages = listOf(Language.Kotlin)

                service.generateQuestCode("test-quest", signature, examples, languages)

                val deleted = service.deleteQuestCode("test-quest")
                deleted.any { it.questId == "test-quest" } shouldBe true

                val exception = shouldThrow<NoSuchElementException> {
                    service.getQuestCode("test-quest")
                }
                exception.message shouldBe "Error while loading CodeQuestCode"
            }
        }
    }
}
