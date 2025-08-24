package com.codemaster.solutionservice.interfaces

import codemaster.servicies.solution.infrastructure.docker.DockerRunner
import io.mockk.mockk
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean

@TestConfiguration
class DockerRunnerTestConfig {
    @Bean
    fun runner(): DockerRunner = mockk<DockerRunner>()
}
