package codemaster.servicies.solution.application

import codemaster.servicies.solution.domain.errors.DomainException
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.withContext
import org.bson.types.ObjectId
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.ExecutionException
import java.util.concurrent.TimeUnit

@Service
class SolutionService(
    private val repository: SolutionRepository
) {

    suspend fun addSolution(
        id: SolutionId,
        user: String,
        questId: ObjectId,
        language: Language,
        code: String
    ): Solution? {
        val newSolution = SolutionFactoryImpl().create(id, user, questId, language, code)
        return repository.addNewSolution(newSolution).awaitSingle()
    }

    suspend fun modifySolutionCode(id: SolutionId, code: String): Solution? {
        return repository.updateCode(id, code).awaitSingle()
    }

    suspend fun modifySolutionLanguage(id: SolutionId, language: Language): Solution? {
        return repository.updateLanguage(id, language).awaitSingle()
    }

    suspend fun getSolution(id: SolutionId): Solution? {
        return repository.findSolutionById(id).awaitSingle()
    }

    suspend fun getSolutionsByQuestId(questId: ObjectId): List<Solution>? {
        return repository.findSolutionsByQuestId(questId).collectList().awaitSingle()
    }

    suspend fun getSolutionsByLanguage(language: Language): List<Solution>? {
        return repository.findSolutionsByLanguage(language).collectList().awaitSingle()
    }

    suspend fun deleteSolution(id: SolutionId): Solution? {
        return repository.removeSolutionById(id).awaitSingle()
    }
}
