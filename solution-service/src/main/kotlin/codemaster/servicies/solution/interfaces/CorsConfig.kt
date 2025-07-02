package codemaster.servicies.solution.interfaces

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource
import org.springframework.web.cors.reactive.CorsWebFilter

@Configuration
class CorsConfig {

    companion object {
        const val MAX_AGE = 1728000L
    }

    @Bean
    fun corsWebFilter(): CorsWebFilter {
        val corsConfig = CorsConfiguration()
        corsConfig.allowedOrigins = listOf("http://localhost:5173")
        corsConfig.allowedMethods = listOf("GET", "POST", "OPTIONS", "DELETE", "PUT")
        corsConfig.allowedHeaders = listOf("Authorization", "Content-Type", "Accept")
        corsConfig.allowCredentials = true
        corsConfig.maxAge = MAX_AGE

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", corsConfig)

        return CorsWebFilter(source)
    }
}
