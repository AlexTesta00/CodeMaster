import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import codemaster.servicies.generator.domain.*
import codemaster.servicies.generator.domain.codegen.JavaLanguageGenerator
import codemaster.servicies.generator.domain.codegen.KotlinLanguageGenerator
import codemaster.servicies.generator.domain.codegen.ScalaLanguageGenerator
import io.kotest.matchers.string.shouldContain

class TestCodeQuestCodeFactory : DescribeSpec({

    val factory = CodeQuestCodeFactory(
        generators = mapOf(
            Language.Kotlin to KotlinLanguageGenerator(),
            Language.Java to JavaLanguageGenerator(),
            Language.Scala to ScalaLanguageGenerator()
        )
    )

    val signature = FunctionSignature(
        name = "reverseString",
        parameters = listOf(FunctionParameter("s", TypeName("string"))),
        returnType = TypeName("string")
    )

    val examples = listOf(
        ExampleCase(inputs = listOf("abc"), output = "cba"),
        ExampleCase(inputs = listOf("chatgpt"), output = "tpgtahc")
    )

    val supportedLanguages = listOf(Language.Kotlin, Language.Java, Language.Scala)

    describe("CodeQuestCodeFactory") {

        val code = factory.create(
            questId = "q123",
            signature = signature,
            examples = examples,
            languages = listOf(Language.Kotlin, Language.Java, Language.Scala)
        )

        it("should generate entries for all selected languages") {
            code.entries.size shouldBe 3
        }

        supportedLanguages.forEach { lang: Language ->
            it("should generate valid template for $lang") {
                val entry = code.entries.find { it.language == lang }!!
                println(entry.templateCode)
                println(entry.testCode)
                entry.templateCode shouldContain signature.name
                entry.templateCode shouldContain "TODO"
            }

            it("should generate tests for $lang with expected values") {
                val entry = code.entries.find { it.language == lang }!!
                println(entry.templateCode)
                println(entry.testCode)
                entry.testCode shouldContain "abc"
                entry.testCode shouldContain "cba"
                entry.testCode shouldContain "chatgpt"
                entry.testCode shouldContain "tpgtahc"
            }
        }

    }
})
