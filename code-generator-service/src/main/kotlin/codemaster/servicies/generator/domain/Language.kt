package codemaster.servicies.generator.domain

enum class Language(val code: String) {
    Kotlin("kotlin"),
    Java("java"),
    Scala("scala");

    companion object {
        fun fromCode(code: String): Language =
            Language.entries.find { it.code.equals(code, ignoreCase = true) }
                ?: throw IllegalArgumentException("Unsupported language: $code")
    }
}
