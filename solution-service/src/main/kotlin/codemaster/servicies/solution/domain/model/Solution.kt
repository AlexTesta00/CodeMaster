package codemaster.servicies.solution.domain.model

import codemaster.servicies.solution.domain.service.CodeEvaluator
import jakarta.persistence.ManyToOne
import org.bson.types.ObjectId
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document("solution")
data class Solution(
    @Id val id: SolutionId,
    val code: String,
    val questId: ObjectId,
    val user: String,
    @ManyToOne val language: Language,
    val result: ExecutionResult = ExecutionResult.Pending,
) {
    fun evaluateWith(evaluator: CodeEvaluator): Solution {
        val executionResult = evaluator.evaluate(this)
        return this.copy(result = executionResult)
    }
}
