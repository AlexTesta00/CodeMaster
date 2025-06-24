package codemaster.servicies.generator.domain

sealed class Language(val name: String) {
    object Kotlin : Language("kotlin")
    object Java : Language("java")
    object Scala : Language("scala")

    companion object {
        fun fromString(value: String): Language = when (value.lowercase()) {
            "kotlin" -> Kotlin
            "java" -> Java
            "scala" -> Scala
            else -> throw IllegalArgumentException("Unsupported language: $value")
        }
    }
}
