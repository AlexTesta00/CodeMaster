package codemaster.servicies.generator.infrastructure

import codemaster.servicies.generator.domain.CodeQuestCode
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface CodeQuestCodeRepository{
    fun save(code: CodeQuestCode): Mono<CodeQuestCode>
    fun findByQuestId(questId: String): Mono<CodeQuestCode>
    fun deleteByQuestId(questId: String): Flux<CodeQuestCode>
}