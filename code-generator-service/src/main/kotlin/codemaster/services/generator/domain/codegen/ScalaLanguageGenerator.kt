import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.domain.codegen.LanguageGenerator

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
            val inputArgs = example.inputs.joinToString(", ") { toLiteral(it, Language.Scala) }
            val expected = toLiteral(example.output, Language.Scala)

            """
            test("test${index + 1}") {
                val result = Main.${signature.name}($inputArgs)
                assert(result == $expected)
            }
            """.trimIndent()
        }.joinToString("\n\n")
    }

    fun toLiteral(value: Any?, language: Language): String {
        return when (value) {
            is String -> "\"$value\""
            is Int, is Double, is Boolean -> value.toString()
            is List<*> -> value.joinToString(", ", "List(", ")") { toLiteral(it, language) }
            is Map<*, *> -> value.entries.joinToString(", ", "Map(", ")") {
                "${toLiteral(it.key, language)} -> ${toLiteral(it.value, language)}"
            }
            is Array<*> -> value.joinToString(", ", "Array(", ")") { toLiteral(it, language) }
            else -> value.toString()
        }
    }
}
