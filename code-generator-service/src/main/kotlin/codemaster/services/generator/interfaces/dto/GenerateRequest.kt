package codemaster.services.generator.interfaces.dto

data class GenerateRequestDto(
    val questId: String,
    val functionName: String,
    val parameters: List<FunctionParameterDto>,
    val returnType: String,
    val examples: List<ExampleCaseDto>,
    val languages: List<String>
)

data class FunctionParameterDto(
    val name: String,
    val typeName: String
)

data class ExampleCaseDto(
    val inputs: List<String>,
    val output: String
)

