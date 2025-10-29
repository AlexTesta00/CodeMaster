package service

import codemaster.services.generator.domain.*
import codemaster.services.generator.domain.codegen.GeneratedCodeEntry
import codemaster.services.generator.infrastructure.CodeQuestCodeRepository
import codemaster.services.generator.service.CodeGeneratorService
import utility.Utility.monoOf
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.mockk.*
import utility.Utility.fluxOf

class CodeGeneratorServiceTest : DescribeSpec({

    val repository = mockk<CodeQuestCodeRepository>()
    val service = CodeGeneratorService(repository)

    beforeTest {
        clearMocks(repository)
    }

    describe("CodeGeneratorService unit tests") {

        it("should generate and save quest code") {
            val signature = FunctionSignature(
                name = "foo",
                parameters = listOf(FunctionParameter("x", TypeName("Int"))),
                returnType = TypeName("Map<Int,Int>")
            )
            val examples = listOf(ExampleCase(inputs = listOf(1), output = mapOf(1 to 2, 2 to 3)))
            val languages = listOf(Language.Kotlin, Language.Java)

            val generated = CodeQuestCode(
                questId = "test-quest",
                entries = listOf(
                    GeneratedCodeEntry(Language.Kotlin, "fun foo(...) { ... }", "test code..."),
                    GeneratedCodeEntry(Language.Java, "public static ...", "test code...")
                )
            )

            every { repository.save(any()) } returns monoOf(generated)

            val codeQuestCode = service.generateQuestCode("test-quest", signature, examples, languages)

            codeQuestCode.questId shouldBe "test-quest"
            codeQuestCode.entries.map { it.language } shouldBe languages

            verify { repository.save(any()) }
        }

        it("should get saved quest code") {
            val savedCode = CodeQuestCode("test-quest", emptyList())
            every { repository.findByQuestId("test-quest") } returns monoOf(savedCode)

            val found = service.getQuestCode("test-quest")

            found.questId shouldBe "test-quest"
            verify { repository.findByQuestId("test-quest") }
        }

        it("should throw NoSuchElementException if quest code not found") {
            every { repository.findByQuestId("nonexistent-quest") } returns monoOf(null)

            val exception = shouldThrow<NoSuchElementException> {
                service.getQuestCode("nonexistent-quest")
            }
            exception.message shouldBe "Error while loading CodeQuestCode"
            verify { repository.findByQuestId("nonexistent-quest") }
        }

        it("should delete quest code by questId") {
            val savedCode = CodeQuestCode("test-quest", emptyList())
            every { repository.deleteByQuestId("test-quest") } returns fluxOf(savedCode)

            val deleted = service.deleteQuestCode("test-quest")

            deleted.any { it.questId == "test-quest" } shouldBe true
            verify { repository.deleteByQuestId("test-quest") }
        }
    }
})
