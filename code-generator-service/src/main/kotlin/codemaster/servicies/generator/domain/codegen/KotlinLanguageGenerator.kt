package codemaster.servicies.generator.domain.codegen

import codemaster.servicies.generator.domain.ExampleCase
import codemaster.servicies.generator.domain.FunctionSignature
import codemaster.servicies.generator.domain.Language

class KotlinLanguageGenerator : LanguageGenerator {
    override fun generateTemplate(signature: FunctionSignature): String {
        val params = signature.parameters.joinToString(", ") {
            "${it.name}: ${it.type.mapTo(Language.Kotlin)}"
        }
        val returnType = signature.returnType.mapTo(Language.Kotlin)

        return """
            fun ${signature.name}($params): $returnType {
                // TODO: implement
            }
        """.trimIndent()
    }

    override fun generateTests(signature: FunctionSignature, examples: List<ExampleCase>): String {
        return examples.mapIndexed { index, example ->
            val inputArgs = example.inputs.joinToString(", ") { toKotlinLiteral(it) }
            val expected = toKotlinLiteral(example.output)

            """
            @Test
            fun test${index + 1}() {
                val result = Main.${signature.name}($inputArgs)
                assertEquals($expected, result)
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    private fun toKotlinLiteral(value: Any): String {
        return when (value) {
            is String -> "\"$value\""
            is Int -> value.toString()
            is List<*> -> value.joinToString(", ", "listOf(", ")") { toKotlinLiteral(it!!) }
            is Array<*> -> value.joinToString(", ", "arrayOf(", ")") { toKotlinLiteral(it!!) }
            else -> value.toString() // fallback
        }
    }
}
