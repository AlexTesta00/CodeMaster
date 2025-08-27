package codemaster.services.generator.domain.events

data class GenerateCodeEvent(
    val questId: String,
    val language: List<String>,
    val functionName: String,
    val parameters: List<Parameter>,
    val returnType: String,
    val examples: List<Example>
) {
    data class Parameter(
        val name: String,
        val typeName: String
    )

    data class Example(
        val inputs: List<String>,
        val output: String
    )
}
