package codemaster.servicies.generator.service

import codemaster.servicies.generator.domain.CodeQuestCode
import codemaster.servicies.generator.domain.CodeQuestCodeFactory
import codemaster.servicies.generator.domain.ExampleCase
import codemaster.servicies.generator.domain.FunctionSignature
import codemaster.servicies.generator.domain.Language
import codemaster.servicies.generator.infrastructure.CodeQuestCodeRepository
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.springframework.stereotype.Service

@Service
class CodeGeneratorService(
    private val codeQuestCodeFactory: CodeQuestCodeFactory,
    private val repository: CodeQuestCodeRepository
) {

    suspend fun generateQuestCode(
        questId: String,
        signature: FunctionSignature,
        examples: List<ExampleCase>,
        languages: List<Language>
    ): CodeQuestCode {
        val questCode = codeQuestCodeFactory.create(questId, signature, examples, languages)
        return repository.save(questCode).awaitSingleOrNull() ?: throw NoSuchElementException("Error while inserting new CodeQuestCode")
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
        if (questCodes.isEmpty()) {
            throw NoSuchElementException("Error while deleting CodeQuestCodes")
        }
        return questCodes ?: throw NoSuchElementException("Error while deleting CodeQuestCodes")
    }
}
