package codemaster.servicies.generator.infrastructure

import codemaster.servicies.generator.domain.CodeQuestCode
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

class CodeQuestCodeRepositoryImpl(private val mongoTemplate: ReactiveMongoTemplate) : CodeQuestCodeRepository {

    override fun save(code: CodeQuestCode): Mono<CodeQuestCode> {
        return mongoTemplate.save(code)
    }

    override fun findByQuestId(questId: String): Mono<CodeQuestCode> {
        return mongoTemplate.findById(questId, CodeQuestCode::class.java)
    }

    override fun deleteByQuestId(questId: String): Flux<CodeQuestCode> {
        val query = Query(Criteria.where("questId").`is`(questId))
        return mongoTemplate.findAllAndRemove<CodeQuestCode>(query, CodeQuestCode::class.java)
    }
}