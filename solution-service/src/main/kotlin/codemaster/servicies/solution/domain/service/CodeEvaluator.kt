package codemaster.servicies.solution.domain.service

import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Solution

interface CodeEvaluator {
    fun evaluate(submission: Solution): ExecutionResult
}
