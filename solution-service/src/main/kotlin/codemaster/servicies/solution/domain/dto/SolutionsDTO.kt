package codemaster.servicies.solution.domain.dto

sealed class SolutionsDTO {
    data class SolutionDTORequest(
        val user: String,
        val questId: String,
        val solved: Boolean,
        val codes: List<CodeDTORequest>,
    )

    data class CodeDTORequest(
        val language: LanguageDTORequest,
        val code: String
    )

    data class LanguageDTORequest(
        val name: String,
        val fileExtension: String
    )

    data class ExecuteDTORequest(
        val code: String,
        val language: LanguageDTORequest,
        val testCode: String
    )
}