package codemaster.servicies.solution.domain.model

import jakarta.persistence.Entity
import org.springframework.beans.factory.annotation.Value

data class Language(
    val name: String,
    val fileExtension: String,
    val version: String,
    val runtime: String
) {}
