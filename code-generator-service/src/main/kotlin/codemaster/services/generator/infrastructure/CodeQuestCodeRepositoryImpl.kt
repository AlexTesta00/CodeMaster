package codemaster.services.generator.infrastructure

import codemaster.services.generator.domain.CodeQuestCode
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
class CodeQuestCodeRepositoryImpl(private val mongoTemplate: ReactiveMongoTemplate) : CodeQuestCodeRepository {

    override fun save(code: CodeQuestCode): Mono<CodeQuestCode> {
        return mongoTemplate.save(code)
    }

    override fun findByQuestId(questId: String): Mono<CodeQuestCode> {
        val query = Query(Criteria.where("questId").`is`(questId))
        return mongoTemplate.findOne(query, CodeQuestCode::class.java)
    }

    override fun deleteByQuestId(questId: String): Flux<CodeQuestCode> {
        val query = Query(Criteria.where("questId").`is`(questId))
        return mongoTemplate.findAllAndRemove(query, CodeQuestCode::class.java)
    }

    override fun existBy(): Mono<Boolean> {
        val query = Query().limit(1)
        return mongoTemplate.exists(query, CodeQuestCode::class.java)
    }
}
