package codemaster.servicies.solution.infrastructure

import codemaster.servicies.solution.domain.model.*
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Filters.eq
import com.mongodb.client.model.ReturnDocument
import com.mongodb.client.model.UpdateOptions
import com.mongodb.client.model.Updates
import com.mongodb.client.model.Updates.set
import org.bson.conversions.Bson
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.mapping.Document
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

    override fun findSolvedSolutionsByUser(user: String): Flux<Solution> {
        val query = Query(Criteria.where("user").`is`(user).and("solved").`is`(true))
        return mongoTemplate.find(query, Solution::class.java)
    }

    override fun findSolutionsByUser(user: String): Flux<Solution> {
        val query = Query(Criteria.where("user").`is`(user))
        return mongoTemplate.find(query, Solution::class.java)
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
            Solution::class.java
        )
    }

    override fun updateCode(
        id: SolutionId,
        code: String,
        language: Language
    ): Mono<Solution> {
        return mongoTemplate.findById(id.value, Solution::class.java)
            .flatMap { solution ->
                val updatedCodes = solution.codes.map {
                    if (it.language == language) it.copy(code = code) else it
                }
                val updatedSolution = solution.copy(codes = updatedCodes)
                mongoTemplate.save(updatedSolution)
            }
    }

    override fun updateSolved(id: SolutionId, solved: Boolean): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))
        val update =
            Update()
                .set("solved", solved)

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            Solution::class.java
        )
    }

    override fun removeSolutionById(id: SolutionId): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))

        return mongoTemplate
            .findAndRemove(query, Solution::class.java)
    }

    override fun removeSolutionsByUser(user: String): Flux<Solution> {
        val query = Query(Criteria.where("user").`is`(user))

        return mongoTemplate
            .findAllAndRemove(query, Solution::class.java)
    }

    override fun removeSolutionsByCodequest(questId: String): Flux<Solution> {
        val query = Query(Criteria.where("questId").`is`(questId))

        return mongoTemplate
            .findAllAndRemove(query, Solution::class.java)
    }

    override fun existBy(): Mono<Boolean> {
        val query = Query().limit(1)
        return mongoTemplate.exists(query, Solution::class.java)
    }
}
