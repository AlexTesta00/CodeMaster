package codemaster.servicies.solution.domain.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document("solution")
data class Solution(
    @Id
    val id: SolutionId,
    val codes: List<Code>,
    val questId: String,
    val user: String,
    val result: ExecutionResult = ExecutionResult.Pending,
    val solved: Boolean
)
