package codemaster.servicies.generator.domain

import codemaster.servicies.generator.domain.codegen.GeneratedCodeEntry
import codemaster.servicies.generator.domain.codegen.LanguageGenerator

class CodeQuestCodeFactory(
    private val generators: Map<Language, LanguageGenerator>
) {
    fun create(
        questId: String,
        signature: FunctionSignature,
        examples: List<ExampleCase>,
        languages: List<Language>
    ): CodeQuestCode {
        val entries = languages.map { lang ->
            val gen = generators[lang]
                ?: throw IllegalArgumentException("Missing generator for $lang")
            GeneratedCodeEntry(
                language = lang,
                templateCode = gen.generateTemplate(signature),
                testCode = gen.generateTests(signature, examples)
            )
        }
        return CodeQuestCode(
            questId = questId,
            entries = entries
        )
    }
}
