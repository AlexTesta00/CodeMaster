package codemaster.servicies.generator.domain

data class FunctionSignature(
    val name: String,
    val parameters: List<FunctionParameter>,
    val returnType: TypeName
)
