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
        solved: Boolean,
        codes: List<Code>
    ): Solution {

        if (user.isBlank()) {
            throw InvalidUserException()
        }

        for (code in codes) {
            if(code.language.name.isBlank() || code.language.fileExtension.isBlank()){
                throw InvalidLanguageException()
            }
            if (code.code.isBlank()) {
                throw EmptyCodeException()
            }
        }

        return Solution(
            id = id,
            user = user,
            questId = questId,
            solved = solved,
            codes = codes
        )
    }
}
