package codemaster.servicies.solution.domain.model

interface SolutionFactory {
    fun create(
        id: SolutionId,
        user: String,
        questId: String,
        solved: Boolean,
        codes: List<Code>
    ): Solution
}
