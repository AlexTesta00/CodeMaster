package codemaster.servicies.solution.domain.repository

import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Language
import codemaster.servicies.solution.domain.model.Solution
import codemaster.servicies.solution.domain.model.SolutionId
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
class SolutionRepositoryImpl(private val mongoTemplate: ReactiveMongoTemplate) : SolutionRepository {
    override fun addNewSolution(solution: Solution): Mono<Solution> {
        return mongoTemplate.insert(solution)
    }

    override fun findSolutionById(id: SolutionId): Mono<Solution> {
        return mongoTemplate.findById(id.toString(), Solution::class.java)
    }

    override fun findSolutionsByQuestId(questId: String): Flux<Solution> {
        val query = Query(Criteria.where("questId").`is`(questId))
        return mongoTemplate.find(query, Solution::class.java)
    }

    override fun findSolutionsByLanguage(language: Language): Flux<Solution> {
        val query = Query(Criteria.where("language").`is`(language))
        return mongoTemplate.find(query, Solution::class.java)
    }

    override fun updateLanguage(
        id: SolutionId,
        language: Language,
    ): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))
        val update =
            Update()
                .set("language", language)

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            Solution::class.java,
        )
    }

    override fun updateResult(
        id: SolutionId,
        result: ExecutionResult,
    ): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))
        val update =
            Update()
                .set("result", result)

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            Solution::class.java,
        )
    }

    override fun updateCode(
        id: SolutionId,
        code: String,
    ): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))
        val update =
            Update()
                .set("code", code)

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            Solution::class.java,
        )
    }

    override fun updateTestCode(
        id: SolutionId,
        testCode: String
    ): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))
        val update =
            Update()
                .set("testCode", testCode)

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            Solution::class.java,
        )
    }

    override fun removeSolutionById(id: SolutionId): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))

        return mongoTemplate
            .findAndRemove(query, Solution::class.java)
    }
}
