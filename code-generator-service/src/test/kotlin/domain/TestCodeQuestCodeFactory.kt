package domain

import KotlinLanguageGenerator
import ScalaLanguageGenerator
import codemaster.services.generator.domain.*
import codemaster.services.generator.domain.codegen.JavaLanguageGenerator
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import org.junit.jupiter.api.TestInstance

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class TestCodeQuestCodeFactory : DescribeSpec({

    val factory = CodeQuestCodeFactory()

    val supportedLanguages = listOf(Language.Kotlin, Language.Java, Language.Scala)

    describe("CodeQuestCodeFactory") {

        listOf(
            Triple(
                "reverseString",
                FunctionSignature(
                    name = "reverseString",
                    parameters = listOf(FunctionParameter("s", TypeName("string"))),
                    returnType = TypeName("string")
                ),
                listOf(
                    ExampleCase(inputs = listOf("abc"), output = "cba"),
                    ExampleCase(inputs = listOf("chatgpt"), output = "tpgtahc")
                )
            ),
            Triple(
                "sumList",
                FunctionSignature(
                    name = "sumList",
                    parameters = listOf(FunctionParameter("nums", TypeName("List<int>"))),
                    returnType = TypeName("int")
                ),
                listOf(
                    ExampleCase(inputs = listOf(listOf(1, 2, 3)), output = 6),
                    ExampleCase(inputs = listOf(listOf(10, -5)), output = 5)
                )
            ),
            Triple(
                "mapSize",
                FunctionSignature(
                    name = "mapSize",
                    parameters = listOf(FunctionParameter("m", TypeName("Map<string, int>"))),
                    returnType = TypeName("int")
                ),
                listOf(
                    ExampleCase(inputs = listOf(mapOf("a" to 1, "b" to 2)), output = 2),
                    ExampleCase(inputs = listOf(mapOf<String, Int>()), output = 0)
                )
            ),
            Triple(
                "complexNest",
                FunctionSignature(
                    name = "complexNest",
                    parameters = listOf(FunctionParameter("m", TypeName("Map<string, List<int>>"))),
                    returnType = TypeName("int")
                ),
                listOf(
                    ExampleCase(inputs = listOf(mapOf("a" to listOf(1, 2))), output = 2),
                    ExampleCase(inputs = listOf(mapOf("a" to listOf(), "b" to listOf(5))), output = 1)
                )
            )
        ).forEach { (name, signature, examples) ->

            val code = factory.create(
                questId = "q_$name",
                signature = signature,
                examples = examples,
                languages = supportedLanguages
            )

            it("should generate entries for all selected languages for $name") {
                code.entries.size shouldBe supportedLanguages.size
            }

            supportedLanguages.forEach { lang ->
                val entry = code.entries.find { it.language == lang }!!

                it("should include function name and TODO in $lang template for $name") {
                    entry.templateCode shouldContain signature.name
                    entry.templateCode shouldContain "TODO"
                }

                it("should include all example inputs/outputs in test code for $name ($lang)") {
                    examples.forEach { ex ->
                        ex.inputs.forEach { input ->
                            val expectedInput = toExpectedLiteral(input, lang)
                            entry.testCode shouldContain expectedInput
                        }
                        val expectedOutput = toExpectedLiteral(ex.output, lang)
                        entry.testCode shouldContain expectedOutput
                    }
                }

                it("should contain correct collection syntax in $lang for $name") {
                    val testCode = entry.testCode

                    val containsList = examples.any { ex ->
                        ex.inputs.any { it is List<*> } || ex.output is List<*>
                    }

                    val containsMap = examples.any { ex ->
                        ex.inputs.any { it is Map<*, *> } || ex.output is Map<*, *>
                    }

                    when (lang) {
                        Language.Kotlin -> {
                            if (containsList) testCode shouldContain "listOf"
                            if (containsMap) testCode shouldContain "mapOf"
                        }
                        Language.Java -> {
                            if (containsList) testCode shouldContain "List.of"
                            if (containsMap) testCode shouldContain "Map."
                        }
                        Language.Scala -> {
                            if (containsList) testCode shouldContain "List("
                            if (containsMap) testCode shouldContain "Map("
                        }
                    }
                }
            }
        }
    }
})

private fun toExpectedLiteral(value: Any?, lang: Language): String = when (lang) {
    Language.Kotlin -> KotlinLanguageGenerator().run { toLiteral(value, Language.Kotlin) }
    Language.Java -> JavaLanguageGenerator().run { toLiteral(value) }
    Language.Scala -> ScalaLanguageGenerator().run { toLiteral(value, Language.Scala) }
}
