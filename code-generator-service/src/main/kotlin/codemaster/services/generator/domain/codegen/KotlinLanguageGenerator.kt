import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.codegen.LanguageGenerator
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

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
            val inputArgs = example.inputs.joinToString(", ") { input ->
                val strInput = input ?: "null"
                toLiteralFromJson(strInput)
            }
            val expected = toLiteralFromJson(example.output ?: "null")

            """
        @Test
        fun test${index + 1}() {
            val result = Main.${signature.name}($inputArgs)
            assertEquals($expected, result)
        }
        """.trimIndent()
        }.joinToString("\n\n")
    }

    private fun toLiteral(value: Any?): String {
        return when (value) {
            null -> "null"
            is String -> "\"${value.replace("\"", "\\\"")}\""
            is Int, is Double, is Boolean -> value.toString()
            is List<*> -> value.joinToString(", ", "listOf(", ")") { toLiteral(it) }
            is Map<*, *> -> value.entries.joinToString(", ", "mapOf(", ")") {
                "${toLiteral(it.key)} to ${toLiteral(it.value)}"
            }
            is Array<*> -> value.joinToString(", ", "arrayOf(", ")") { toLiteral(it) }
            else -> throw IllegalArgumentException("Unsupported type: ${value::class}")
        }
    }

    fun toLiteralFromJson(raw: Any?): String {
        val value = if (raw is String) {
            try {
                ObjectMapper().readValue(raw, object : TypeReference<Any>() {})
            } catch (e: Exception) {
                raw
            }
        } else {
            raw
        }
        return toLiteral(value)
    }
}
