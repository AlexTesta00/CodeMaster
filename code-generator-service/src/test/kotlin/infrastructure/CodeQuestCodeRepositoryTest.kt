import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.CodeQuestCodeFactory
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.TypeName
import codemaster.services.generator.infrastructure.CodeQuestCodeRepositoryImpl
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.findAndRemove
import org.springframework.data.mongodb.core.findOne
import org.springframework.data.mongodb.core.query.Query
import utility.Utility.fluxOf
import utility.Utility.monoOf

class CodeQuestCodeRepositoryTest : DescribeSpec({

    val mongoTemplate = mockk<ReactiveMongoTemplate>()
    val repository = CodeQuestCodeRepositoryImpl(mongoTemplate)

    val codeQuestCode = CodeQuestCodeFactory().create(
        "test-quest",
        signature = FunctionSignature("foo", listOf(), TypeName("Int")),
        examples = emptyList(),
        languages = listOf(Language.Kotlin)
    )

    describe("CodeQuestCodeRepositoryTest") {

        it("should save and find by questId") {

            coEvery { mongoTemplate.save(codeQuestCode) } returns monoOf(codeQuestCode)
            coEvery { mongoTemplate.findOne(any(), CodeQuestCode::class.java) } returns monoOf(codeQuestCode)

            val saved = repository.save(codeQuestCode).awaitSingleOrNull()
            saved?.questId shouldBe "test-quest"

            val found = repository.findByQuestId("test-quest").awaitSingleOrNull()
            found?.questId shouldBe "test-quest"

            coVerify(exactly = 1) { repository.save(codeQuestCode) }
            coVerify(exactly = 1) { repository.findByQuestId("test-quest") }
        }

        it("should delete by questId") {
            coEvery {
                mongoTemplate.findAllAndRemove(any<Query>(), CodeQuestCode::class.java)
            } returns fluxOf(codeQuestCode)
            coEvery {
                mongoTemplate.findOne(any(), CodeQuestCode::class.java)
            } returns monoOf(null)

            runBlocking {
                repository.deleteByQuestId("quest-delete")
                val found = repository.findByQuestId("quest-delete").awaitSingleOrNull()
                found shouldBe null
            }

            coVerify(exactly = 1) { repository.deleteByQuestId("quest-delete") }
        }
    }
})
