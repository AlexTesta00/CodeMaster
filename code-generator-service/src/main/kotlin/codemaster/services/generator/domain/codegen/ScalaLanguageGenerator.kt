import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.codegen.LanguageGenerator
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper

class ScalaLanguageGenerator : LanguageGenerator {

    override fun generateTemplate(signature: FunctionSignature): String {
        val params = signature.parameters.joinToString(", ") {
            "${it.name}: ${it.type.mapTo(Language.Scala)}"
        }
        val returnType = signature.returnType.mapTo(Language.Scala)

        return """
            def ${signature.name}($params): $returnType = {
                // TODO: implement
                ???
            }
        """.trimIndent()
    }

    override fun generateTests(signature: FunctionSignature, examples: List<ExampleCase>): String {
        return examples.mapIndexed { index, example ->
            val inputArgs = example.inputs.joinToString(", ") { toLiteralFromJson(it) }
            val expected = toLiteralFromJson(example.output)
            """
            @Test
            def test${index + 1}(): Unit = {
                val result = Main.${signature.name}($inputArgs)
                assert(result == $expected)
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    private fun toLiteral(value: Any?): String = when (value) {
        null -> "null"
        is String -> "\"${value.replace("\"", "\\\"")}\""
        is Int, is Double, is Boolean -> value.toString()
        is List<*> -> value.joinToString(", ", "List(", ")") { toLiteral(it) }
        is Map<*, *> -> value.entries.joinToString(", ", "Map(", ")") {
            "${toLiteral(it.key)} -> ${toLiteral(it.value)}"
        }
        is Array<*> -> value.joinToString(", ", "Array(", ")") { toLiteral(it) }
        is Pair<*, *> -> "(${toLiteral(value.first)}, ${toLiteral(value.second)})"
        else -> value.toString()
    }

    fun toLiteralFromJson(raw: Any?): String {
        val mapper = ObjectMapper()
        val value = if (raw is String) {
            try {
                mapper.readValue(raw, object : TypeReference<Any>() {})
            } catch (e: Exception) {
                raw
            }
        } else {
            raw
        }
        return toLiteral(value)
    }
}
