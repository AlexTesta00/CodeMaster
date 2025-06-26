package codemaster.services.generator.domain.codegen

import codemaster.services.generator.domain.Language

data class GeneratedCodeEntry(
    val language: Language,
    val templateCode: String,
    val testCode: String
)
