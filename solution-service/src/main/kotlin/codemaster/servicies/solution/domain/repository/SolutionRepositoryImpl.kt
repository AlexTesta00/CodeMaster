package codemaster.servicies.solution.domain.repository

import codemaster.servicies.solution.domain.model.*
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

    override fun findSolutionsByLanguage(language: Language, questId: String): Flux<Solution> {
        val query = Query(Criteria.where("language").`is`(language).and("questId").`is`(questId))
        return mongoTemplate.find(query, Solution::class.java)
    }

    override fun findSolvedSolutionsByUser(user: String): Flux<Solution> {
        val query = Query(Criteria.where("user").`is`(user).and("solved").`is`(true))
        return mongoTemplate.find(query, Solution::class.java)
    }

    override fun findSolutionsByUserAndDifficulty(user: String, difficulty: Difficulty): Flux<Solution> {
        val query = Query(Criteria
            .where("difficulty").`is`(difficulty)
            .and("user").`is`(user)
            .and("solved").`is`(true)
        )
        return mongoTemplate.find(query, Solution::class.java)
    }

    override fun findSolutionsByUser(user: String): Flux<Solution> {
        val query = Query(Criteria.where("user").`is`(user))
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
            Solution::class.java
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
            Solution::class.java
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
            Solution::class.java
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
            Solution::class.java
        )
    }

    override fun updateDifficulty(
        id: SolutionId,
        difficulty: Difficulty
    ): Mono<Solution> {
        val query = Query(Criteria.where("_id").`is`(id.value))
        val update =
            Update()
                .set("difficulty", difficulty)

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            Solution::class.java
        )
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
