package codemaster.servicies.solution.domain.model

import codemaster.servicies.solution.domain.errors.EmptyCodeException
import codemaster.servicies.solution.domain.errors.InvalidLanguageException
import codemaster.servicies.solution.domain.errors.InvalidUserException
import org.springframework.stereotype.Component

@Component
class SolutionFactoryImpl : SolutionFactory {
    override fun create(
        id: SolutionId,
        user: String,
        questId: String,
        language: Language,
        code: String,
        testCode: String
    ): Solution {
        if(language.name.isBlank() || language.fileExtension.isBlank()){
            throw InvalidLanguageException()
        }

        if (user.isBlank()) {
            throw InvalidUserException()
        }

        if (code.isBlank() || testCode.isBlank()) {
            throw EmptyCodeException()
        }

        return Solution(
            id = id,
            user = user,
            questId = questId,
            language = language,
            code = code,
            testCode = testCode
        )
    }
}
