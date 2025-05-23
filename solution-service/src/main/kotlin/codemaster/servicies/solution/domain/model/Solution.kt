package codemaster.servicies.solution.domain.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document("solution")
data class Solution(
    @Id
    val id: SolutionId,
    val code: String,
    val questId: String,
    val user: String,
    val language: Language,
    val result: ExecutionResult = ExecutionResult.Pending,
    val testCode: String
)
