package infrastructure

import codemaster.services.generator.Application
import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.CodeQuestCodeFactory
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionParameter
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.TypeName
import codemaster.services.generator.domain.codegen.GeneratedCodeEntry
import codemaster.services.generator.infrastructure.CodeQuestCodeRepository
import codemaster.services.generator.infrastructure.CodeQuestCodeRepositoryImpl
import com.mongodb.reactivestreams.client.MongoClients
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.mongo.transitions.Mongod
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess
import de.flapdoodle.reverse.StateID
import de.flapdoodle.reverse.TransitionWalker
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.SimpleReactiveMongoDatabaseFactory
import org.springframework.data.mongodb.core.convert.MappingMongoConverter
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver
import org.springframework.data.mongodb.core.mapping.MongoMappingContext
import org.springframework.data.mongodb.core.mapping.MongoSimpleTypes
import org.springframework.data.mongodb.core.query.Query

@SpringBootTest(classes = [Application::class])
class CodeQuestCodeRepositoryTest : DescribeSpec() {

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: CodeQuestCodeRepository

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
        }

        afterSpec {
            mongodProcess.current().stop()
        }

        afterEach {
            runBlocking {
                reactiveMongoTemplate.remove(Query(), CodeQuestCode::class.java).awaitSingleOrNull()
            }
        }

        describe("CodeQuestCodeRepository") {

            it("should save and find by questId") {
                val signature = FunctionSignature(
                    name = "foo",
                    parameters = listOf(FunctionParameter("x", TypeName("Int"))),
                    returnType = TypeName("Map<Int,Int>")
                )
                val examples = listOf(ExampleCase(inputs = listOf(1), output = mapOf(1 to 2, 2 to 3)))
                val languages = listOf(Language.Kotlin, Language.Java)

                val codeQuestCode = CodeQuestCodeFactory().create("test-quest", signature, examples, languages)

                val saved = repository.save(codeQuestCode).awaitSingle()
                saved.questId shouldBe "test-quest"
                saved.entries.any { it.language == Language.Kotlin && it.templateCode.contains("TODO") } shouldBe true

                val found = repository.findByQuestId("test-quest").awaitSingle()
                found.questId shouldBe "test-quest"
                found.entries.any { it.language == Language.Kotlin && it.templateCode.contains("TODO") } shouldBe true
            }

            it("should find with Kotlin language") {
                val codeQuestCode = CodeQuestCode(
                    questId = "kotlin-find",
                    entries = listOf(
                        GeneratedCodeEntry(
                            language = Language.Kotlin,
                            templateCode = "fun foo() = TODO()",
                            testCode = "test case"
                        )
                    )
                )

                val saved = repository.save(codeQuestCode).awaitSingle()
                saved.questId shouldBe "kotlin-find"

                val found = repository.findByQuestId("kotlin-find").awaitSingle()
                found.questId shouldBe "kotlin-find"
                found.entries.any { it.language == Language.Kotlin } shouldBe true
            }

            it("should delete by questId") {
                val codeQuestCode = CodeQuestCode(
                    questId = "quest-delete",
                    entries = listOf(
                        GeneratedCodeEntry(
                            language = Language.Kotlin,
                            templateCode = "fun foo() = TODO()",
                            testCode = "test case"
                        )
                    )
                )

                repository.save(codeQuestCode).awaitSingle()

                repository.deleteByQuestId("quest-delete").awaitSingle()

                val found = repository.findByQuestId("quest-delete").awaitSingleOrNull()
                found shouldBe null
            }
        }
    }
}
