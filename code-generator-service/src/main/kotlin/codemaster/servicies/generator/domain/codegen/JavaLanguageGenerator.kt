package codemaster.servicies.generator.domain.codegen

import codemaster.servicies.generator.domain.ExampleCase
import codemaster.servicies.generator.domain.FunctionSignature
import codemaster.servicies.generator.domain.Language


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
            val inputArgs = example.inputs.joinToString(", ") { toJavaLiteral(it) }
            val expected = toJavaLiteral(example.output)

            """
            @Test
            public void test${index + 1}() {
                var result = Main.${signature.name}($inputArgs);
                assertEquals($expected, result);
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    private fun toJavaLiteral(value: Any): String {
        return when (value) {
            is String -> "\"$value\""
            is Int -> value.toString()
            is List<*> -> "List.of(${value.joinToString(", ") { toJavaLiteral(it!!) }})"
            is Array<*> -> "{ ${value.joinToString(", ") { toJavaLiteral(it!!) }} }"
            else -> value.toString()
        }
    }
}
