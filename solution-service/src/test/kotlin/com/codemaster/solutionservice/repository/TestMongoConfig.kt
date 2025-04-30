package com.codemaster.solutionservice

import com.mongodb.reactivestreams.client.MongoClients
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.data.mongodb.core.ReactiveMongoTemplate

@TestConfiguration
class TestMongoConfig {
    @Bean
    fun reactiveMongoTemplate(): ReactiveMongoTemplate {
        val mongoClient = MongoClients.create("mongodb://localhost:27017")
        return ReactiveMongoTemplate(mongoClient, "codemaster")
    }
}