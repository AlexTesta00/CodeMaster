package codemaster.servicies.generator.domain.codegen

import codemaster.servicies.generator.domain.ExampleCase
import codemaster.servicies.generator.domain.FunctionSignature
import codemaster.servicies.generator.domain.Language

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
            val inputArgs = example.inputs.joinToString(", ") { toScalaLiteral(it) }
            val expected = toScalaLiteral(example.output)

            """
            test("test${index + 1}") {
                val result = Main.${signature.name}($inputArgs)
                assert(result == $expected)
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    private fun toScalaLiteral(value: Any): String {
        return when (value) {
            is String -> "\"$value\""
            is Int -> value.toString()
            is List<*> -> value.joinToString(", ", "List(", ")") { toScalaLiteral(it!!) }
            is Array<*> -> value.joinToString(", ", "Array(", ")") { toScalaLiteral(it!!) }
            else -> value.toString()
        }
    }
}
