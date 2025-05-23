package codemaster.servicies.solution.domain.model

interface SolutionFactory {
    fun create(
        id: SolutionId,
        user: String,
        questId: String,
        language: Language,
        code: String,
        testCode: String
    ): Solution
}
