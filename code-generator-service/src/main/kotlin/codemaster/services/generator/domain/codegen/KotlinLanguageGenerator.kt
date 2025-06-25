import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.codegen.LanguageGenerator

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
            val inputArgs = example.inputs.joinToString(", ") { toLiteral(it, Language.Kotlin) }
            val expected = toLiteral(example.output, Language.Kotlin)

            """
            @Test
            fun test${index + 1}() {
                val result = Main.${signature.name}($inputArgs)
                assertEquals($expected, result)
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    fun toLiteral(value: Any?, language: Language): String {
        return when (value) {
            is String -> "\"$value\""
            is Int, is Double, is Boolean -> value.toString()
            is List<*> -> value.joinToString(", ", "listOf(", ")") { toLiteral(it, language) }
            is Map<*, *> -> value.entries.joinToString(", ", "mapOf(", ")") {
                "${toLiteral(it.key, language)} to ${toLiteral(it.value, language)}"
            }
            is Array<*> -> value.joinToString(", ", "arrayOf(", ")") { toLiteral(it, language) }
            else -> value.toString()
        }
    }
}
