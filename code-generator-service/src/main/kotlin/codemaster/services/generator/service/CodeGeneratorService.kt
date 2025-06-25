package codemaster.services.generator.service

import codemaster.services.generator.domain.CodeQuestCode
import codemaster.services.generator.domain.CodeQuestCodeFactory
import codemaster.services.generator.domain.ExampleCase
import codemaster.services.generator.domain.FunctionSignature
import codemaster.services.generator.domain.Language
import codemaster.services.generator.infrastructure.CodeQuestCodeRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.springframework.stereotype.Service

@Service
class CodeGeneratorService(
    private val repository: CodeQuestCodeRepository
) {

    suspend fun generateQuestCode(
        questId: String,
        signature: FunctionSignature,
        examples: List<ExampleCase>,
        languages: List<Language>
    ): CodeQuestCode {
        val questCode = CodeQuestCodeFactory().create(questId, signature, examples, languages)
        return repository.save(questCode).awaitSingleOrNull()
            ?: throw NoSuchElementException("Error while inserting new CodeQuestCode")
    }

    suspend fun getQuestCode(
        questId: String
    ): CodeQuestCode {
        val questCode = repository.findByQuestId(questId).awaitSingleOrNull()
        return questCode ?: throw NoSuchElementException("Error while loading CodeQuestCode")
    }

    suspend fun deleteQuestCode(
        questId: String
    ): List<CodeQuestCode> {
        val questCodes = repository.deleteByQuestId(questId).collectList().awaitSingle()
        return questCodes
    }

    suspend fun pingMongo(): Boolean {
        return try {
            repository.existBy().awaitFirst()
            true
        } catch (e: Exception) {
            false
        }
    }
}
