package codemaster.services.generator.domain.codegen
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language

class JavaLanguageGenerator : LanguageGenerator {

    override fun generateTemplate(signature: FunctionSignature): String {
        val params = signature.parameters.joinToString(", ") {
            "${it.type.mapTo(Language.Java)} ${it.name}"
        }
        val returnType = signature.returnType.mapTo(Language.Java)

        return """
            public class Main {
                public static $returnType ${signature.name}($params) {
                    // TODO: implement
                    return null;
                }
            }
        """.trimIndent()
    }

    override fun generateTests(signature: FunctionSignature, examples: List<ExampleCase>): String {
        return examples.mapIndexed { index, example ->
            val inputArgs = example.inputs.joinToString(", ") { toLiteral(it) }
            val expected = toLiteral(example.output)

            """
            @Test
            public void test${index + 1}() {
                var result = Main.${signature.name}($inputArgs);
                assertEquals($expected, result);
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    fun toLiteral(value: Any?): String = when (value) {
        is String -> "\"$value\""
        is Int, is Double, is Boolean -> value.toString()
        is List<*> -> "List.of(${value.joinToString(", ") { toLiteral(it!!) }})"
        is Map<*, *> -> value.entries.joinToString(
            ", ", "Map.ofEntries(", ")"
        ) { "Map.entry(${toLiteral(it.key)}, ${toLiteral(it.value)})" }
        is Array<*> -> "new ${inferJavaArrayType(value)}{${value.joinToString(", ") { toLiteral(it!!) }}}"
        else -> value.toString()
    }

    private fun inferJavaArrayType(array: Array<*>): String = when {
        array.all { it is Int } -> "int[]"
        array.all { it is String } -> "String[]"
        else -> "Object[]"
    }
}
