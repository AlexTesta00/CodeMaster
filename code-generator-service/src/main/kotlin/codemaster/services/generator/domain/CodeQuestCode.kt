package codemaster.services.generator.domain

import codemaster.services.generator.domain.codegen.GeneratedCodeEntry
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "codequest_code")
data class CodeQuestCode(
    @Id
    val questId: String,
    val entries: List<GeneratedCodeEntry>
)
