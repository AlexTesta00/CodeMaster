package codemaster.servicies.solution.infrastructure

import codemaster.servicies.solution.domain.model.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface SolutionRepository {

    fun addNewSolution(solution: Solution): Mono<Solution>

    fun findSolutionById(id: SolutionId): Mono<Solution>

    fun findSolutionsByQuestId(questId: String): Flux<Solution>

    fun findSolvedSolutionsByUser(user: String): Flux<Solution>

    fun findSolutionsByUser(user: String): Flux<Solution>

    fun updateResult(
        id: SolutionId,
        result: ExecutionResult,
    ): Mono<Solution>

    fun updateCode(
        id: SolutionId,
        code: String,
        language: Language
    ): Mono<Solution>

    fun updateSolved(
        id: SolutionId,
        solved: Boolean
    ): Mono<Solution>

    fun removeSolutionById(id: SolutionId): Mono<Solution>

    fun removeSolutionsByUser(user: String): Flux<Solution>

    fun removeSolutionsByCodequest(questId: String): Flux<Solution>

    fun existBy(): Mono<Boolean>
}
