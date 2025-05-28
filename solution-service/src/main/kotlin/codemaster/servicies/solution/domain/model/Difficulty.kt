package codemaster.servicies.solution.domain.model

sealed class Difficulty(val name: String) {
    data object Easy : Difficulty("easy")
    data object Medium : Difficulty("medium")
    data object Hard : Difficulty("hard")

    companion object {
        fun from(name: String): Difficulty = when (name.lowercase()) {
            "easy" -> Easy
            "medium" -> Medium
            "hard" -> Hard
            else -> throw IllegalArgumentException("Unknown difficulty: $name")
        }
    }
}

