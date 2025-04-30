package codemaster.servicies.solution.domain.repository

import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Language
import codemaster.servicies.solution.domain.model.Solution
import codemaster.servicies.solution.domain.model.SolutionId
import reactor.core.publisher.Mono

interface SolutionRepository {
    fun addNewSolution(solution: Solution): Mono<Solution>

    fun findSolutionById(id: SolutionId): Mono<Solution>

    fun updateLanguage(
        id: SolutionId,
        language: Language,
    ): Mono<Solution>

    fun updateResult(
        id: SolutionId,
        result: ExecutionResult,
    ): Mono<Solution>

    fun updateCode(
        id: SolutionId,
        code: String,
    ): Mono<Solution>

    fun removeSolutionById(id: SolutionId): Mono<Solution>
}
