
import com.mongodb.reactivestreams.client.MongoClients
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.SimpleReactiveMongoDatabaseFactory
import org.springframework.data.mongodb.core.convert.MappingMongoConverter
import org.springframework.data.mongodb.core.convert.NoOpDbRefResolver
import org.springframework.data.mongodb.core.mapping.MongoMappingContext
import org.springframework.data.mongodb.core.mapping.MongoSimpleTypes

@Configuration
class TestMongoConfig {

    @Bean
    fun reactiveMongoTemplate(): ReactiveMongoTemplate {
        val connectionString = System.getenv("MONGO_URI") ?: "mongodb://localhost:27017/codemaster"
        val client = MongoClients.create(connectionString)
        val factory = SimpleReactiveMongoDatabaseFactory(client,"test")

        val mappingContext = MongoMappingContext().apply {
            setSimpleTypeHolder(MongoSimpleTypes.HOLDER)
            afterPropertiesSet()
        }

        val converter = MappingMongoConverter(NoOpDbRefResolver.INSTANCE, mappingContext).apply {
            afterPropertiesSet()
        }

        return ReactiveMongoTemplate(factory, converter)
    }
}