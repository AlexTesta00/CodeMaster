package codemaster.servicies.generator.domain.codegen

import codemaster.servicies.generator.domain.Language

data class GeneratedCodeEntry(
    val language: Language,
    val templateCode: String,
    val testCode: String
)
