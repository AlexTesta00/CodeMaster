package codemaster.servicies.solution.infrastructure.docker

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class DockerRunnerConfig {

    @Bean
    fun dockerRunner(): DockerRunnerImpl {
        return DockerRunnerImpl()
    }
}
