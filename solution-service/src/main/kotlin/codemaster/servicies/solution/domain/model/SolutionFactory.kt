package codemaster.servicies.solution.domain.model

import org.bson.types.ObjectId

interface SolutionFactory {
    fun create(
        id: SolutionId,
        user: String,
        questId: ObjectId,
        language: Language,
        code: String
    ): Solution
}