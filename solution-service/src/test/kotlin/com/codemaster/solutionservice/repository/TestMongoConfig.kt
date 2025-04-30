package com.codemaster.solutionservice.repository

import codemaster.servicies.solution.domain.model.SolutionIdReader
import codemaster.servicies.solution.domain.model.SolutionIdWriter
import com.mongodb.ConnectionString
import com.mongodb.reactivestreams.client.MongoClients
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.ReactiveMongoDatabaseFactory
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.SimpleReactiveMongoDatabaseFactory
import org.springframework.data.mongodb.core.convert.MongoCustomConversions

@Configuration
class TestMongoConfig {
    @Bean
    fun reactiveMongoClient(): com.mongodb.reactivestreams.client.MongoClient {
        return MongoClients.create(ConnectionString("mongodb://localhost:27017/test"))
    }

    @Bean
    fun reactiveMongoDatabaseFactory(): ReactiveMongoDatabaseFactory {
        return SimpleReactiveMongoDatabaseFactory(ConnectionString("mongodb://localhost:27017/test"))
    }

    @Bean
    fun reactiveMongoTemplate(factory: ReactiveMongoDatabaseFactory): ReactiveMongoTemplate {
        return ReactiveMongoTemplate(factory)
    }

    @Bean
    fun customConversions(): MongoCustomConversions {
        return MongoCustomConversions(
            listOf(SolutionIdWriter(), SolutionIdReader()),
        )
    }
}
