package codemaster.services.generator.infrastructure

import codemaster.services.generator.domain.CodeQuestCode
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface CodeQuestCodeRepository{

    fun save(code: CodeQuestCode): Mono<CodeQuestCode>

    fun findByQuestId(questId: String): Mono<CodeQuestCode>

    fun deleteByQuestId(questId: String): Flux<CodeQuestCode>

    fun existBy(): Mono<Boolean>

}
