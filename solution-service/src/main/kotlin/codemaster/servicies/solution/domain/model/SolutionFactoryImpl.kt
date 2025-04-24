package codemaster.servicies.solution.domain.model

import codemaster.servicies.solution.domain.errors.EmptyCodeException
import codemaster.servicies.solution.domain.errors.InvalidUserException
import org.bson.types.ObjectId
import org.springframework.stereotype.Component

@Component
class SolutionFactoryImpl : SolutionFactory {
    override fun create(
        id: SolutionId,
        user: String,
        questId: ObjectId,
        language: Language,
        code: String
    ): Solution {

        if (user.isBlank()) {
            throw InvalidUserException(questId.toHexString())
        }

        if (code.isBlank()) {
            throw EmptyCodeException()
        }

        return Solution(
            id = id,
            user = user,
            questId = questId,
            language = language,
            code = code
        )
    }
}