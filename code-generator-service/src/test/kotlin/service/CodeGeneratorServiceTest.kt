package service

import codemaster.servicies.generator.domain.*
import codemaster.servicies.generator.infrastructure.CodeQuestCodeRepositoryImpl
import codemaster.servicies.generator.service.CodeGeneratorService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.runBlocking
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Query
import codemaster.servicies.generator.domain.codegen.GeneratorConfig

@SpringBootTest(classes = [
    CodeGeneratorService::class,
    CodeQuestCodeRepositoryImpl::class,
    GeneratorConfig::class,
    TestMongoConfig::class
])
class CodeGeneratorServiceTest @Autowired constructor(
    private val service: CodeGeneratorService,
    private val reactiveMongoTemplate: ReactiveMongoTemplate
) : DescribeSpec() {

    init {

        afterEach {
            runBlocking {
                reactiveMongoTemplate.remove(Query(), CodeQuestCode::class.java).awaitSingleOrNull()
            }
        }

        describe("CodeGeneratorService") {

            it("should generate and save quest code") {
                val signature = FunctionSignature(
                    name = "foo",
                    parameters = listOf(FunctionParameter("x", TypeName("Int"))),
                    returnType = TypeName("Int")
                )
                val examples = listOf(ExampleCase(inputs = listOf(1), output = 2))
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

            it("should throw NoSuchElementException if no quest code deleted on deleteQuestCode") {
                val exception = shouldThrow<NoSuchElementException> {
                    service.deleteQuestCode("nonexistent-quest")
                }
                exception.message shouldBe "Error while deleting CodeQuestCodes"
            }
        }
    }
}
