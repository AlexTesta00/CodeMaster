package codemaster.services.generator.domain.codegen

import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature

interface LanguageGenerator {
    fun generateTemplate(signature: FunctionSignature): String
    fun generateTests(signature: FunctionSignature, examples: List<ExampleCase>): String
}
