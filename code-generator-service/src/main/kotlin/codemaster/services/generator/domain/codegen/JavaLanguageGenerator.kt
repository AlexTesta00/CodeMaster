package codemaster.services.generator.domain.codegen
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper

class JavaLanguageGenerator : LanguageGenerator {

    override fun generateTemplate(signature: FunctionSignature): String {
        val params = signature.parameters.joinToString(", ") {
            "${it.type.mapTo(Language.Java)} ${it.name}"
        }
        val returnType = signature.returnType.mapTo(Language.Java)

        return """
            public static $returnType ${signature.name}($params) {
                // TODO: implement
                return null;
            }
        """.trimIndent()
    }

    override fun generateTests(signature: FunctionSignature, examples: List<ExampleCase>): String {
        return examples.mapIndexed { index, example ->
            val inputArgs = example.inputs.joinToString(", ") { toLiteralFromJson(it) }
            val expected = toLiteralFromJson(example.output)

            """
            @Test
            public void test${index + 1}() {
                var result = Main.${signature.name}($inputArgs);
                assertEquals($expected, result);
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    private fun toLiteral(value: Any?): String = when (value) {
        null -> "null"
        is String -> "\"${value.replace("\"", "\\\"")}\""
        is Int, is Double, is Boolean -> value.toString()
        is List<*> -> "List.of(${value.joinToString(", ") { toLiteral(it) }})"
        is Map<*, *> -> {
            val entries = value.entries
                .map { "Map.entry(${toLiteral(it.key)}, ${toLiteral(it.value)})" }
            "Map.ofEntries(${entries.joinToString(", ")})"
        }
        is Array<*> -> "new ${inferJavaArrayType(value)}{${value.joinToString(", ") { toLiteral(it) }}}"
        else -> value.toString()
    }

    private fun inferJavaArrayType(array: Array<*>): String = when {
        array.all { it is Int } -> "int[]"
        array.all { it is String } -> "String[]"
        else -> "Object[]"
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

