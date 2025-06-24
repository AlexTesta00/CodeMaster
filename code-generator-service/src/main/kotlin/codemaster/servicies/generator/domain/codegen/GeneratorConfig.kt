package codemaster.servicies.generator.domain.codegen

import codemaster.servicies.generator.domain.CodeQuestCodeFactory
import codemaster.servicies.generator.domain.Language
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class GeneratorConfig {

    @Bean
    fun languageGenerators(): Map<Language, LanguageGenerator> = mapOf(
        Language.Kotlin to KotlinLanguageGenerator(),
        Language.Java to JavaLanguageGenerator(),
        Language.Scala to ScalaLanguageGenerator()
    )

    @Bean
    fun codeQuestCodeFactory(
        generators: Map<Language, LanguageGenerator>
    ): CodeQuestCodeFactory = CodeQuestCodeFactory(generators)
}
