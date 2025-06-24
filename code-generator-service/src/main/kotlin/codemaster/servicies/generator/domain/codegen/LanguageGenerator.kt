package codemaster.servicies.generator.domain.codegen

import codemaster.servicies.generator.domain.ExampleCase
import codemaster.servicies.generator.domain.FunctionSignature

interface LanguageGenerator {
    fun generateTemplate(signature: FunctionSignature): String
    fun generateTests(signature: FunctionSignature, examples: List<ExampleCase>): String
}
