package infrastructure

import codemaster.servicies.generator.Application
import codemaster.servicies.generator.domain.CodeQuestCode
import codemaster.servicies.generator.domain.Language
import codemaster.servicies.generator.domain.codegen.GeneratedCodeEntry
import codemaster.servicies.generator.infrastructure.CodeQuestCodeRepository
import codemaster.servicies.generator.infrastructure.CodeQuestCodeRepositoryImpl
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
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [Application::class])
class CodeQuestCodeRepositoryTest : DescribeSpec(){

    private lateinit var mongodProcess: TransitionWalker.ReachedState<RunningMongodProcess>
    private var startedEmbeddedMongo = false
    private lateinit var reactiveMongoTemplate: ReactiveMongoTemplate
    private lateinit var repository: CodeQuestCodeRepository


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

            val converter = MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext).apply {
                afterPropertiesSet()
            }

            reactiveMongoTemplate = ReactiveMongoTemplate(factory, converter)
            repository = CodeQuestCodeRepositoryImpl(reactiveMongoTemplate)
        }

        afterEach {
            runBlocking {
                reactiveMongoTemplate.remove(Query(), CodeQuestCode::class.java).awaitSingleOrNull()
            }
        }

        describe("CodeQuestCodeRepository") {

            it("should save and find by questId") {
                val codeQuestCode = CodeQuestCode(
                    questId = "quest-find",
                    entries = listOf(
                        GeneratedCodeEntry(
                            language = Language.Kotlin,
                            templateCode = "fun foo() = TODO()",
                            testCode = "test case"
                        )
                    )
                )

                val saved = repository.save(codeQuestCode).awaitSingle()
                saved.questId shouldBe "quest-find"
                saved.entries.any { it.language == Language.Kotlin && it.templateCode.contains("TODO") } shouldBe true

                val found = repository.findByQuestId("quest-find").awaitSingle()
                found.questId shouldBe "quest-find"
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
