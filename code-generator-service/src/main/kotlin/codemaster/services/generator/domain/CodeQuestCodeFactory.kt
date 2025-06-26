package codemaster.services.generator.domain

import KotlinLanguageGenerator
import ScalaLanguageGenerator
import codemaster.services.generator.domain.codegen.GeneratedCodeEntry
import codemaster.services.generator.domain.codegen.JavaLanguageGenerator
import codemaster.services.generator.domain.codegen.LanguageGenerator
import org.springframework.stereotype.Component

@Component
class CodeQuestCodeFactory {

    val generator: Map<Language, LanguageGenerator> = mapOf(
        Language.Java to JavaLanguageGenerator(),
        Language.Scala to ScalaLanguageGenerator(),
        Language.Kotlin to KotlinLanguageGenerator()
    )

    fun create(
        questId: String,
        signature: FunctionSignature,
        examples: List<ExampleCase>,
        languages: List<Language>
    ): CodeQuestCode {
        val entries = languages.map { lang ->
            GeneratedCodeEntry(
                language = lang,
                templateCode = generator[lang]!!.generateTemplate(signature),
                testCode = generator[lang]!!.generateTests(signature, examples)
            )
        }
        return CodeQuestCode(
            questId = questId,
            entries = entries
        )
    }
}
