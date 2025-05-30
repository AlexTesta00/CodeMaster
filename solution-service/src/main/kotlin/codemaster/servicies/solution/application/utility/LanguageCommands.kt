package codemaster.servicies.solution.application.utility

import codemaster.servicies.solution.domain.model.Language

data class LanguageCommands(
    val compileCommand: String,
    val runCommand: String
)

object LanguageCommandProvider {
    fun getCommandsFor(language: Language): LanguageCommands = when (language.name) {
        "Java" -> LanguageCommands(
            compileCommand = """
                cd /code && \
                javac -cp /usr/share/java/junit-platform-console-standalone.jar Main.java
            """.trimIndent(),
            runCommand = """
                cd /code && \
                java -jar /usr/share/java/junit-platform-console-standalone.jar \
                    execute \
                    --class-path . \
                    --select-class Main 
            """.trimIndent()
        )

        "Kotlin" -> LanguageCommands(
            compileCommand = """
                cd /code && \
                mkdir -p ./out && \
                kotlinc Main.kt -cp /usr/share/java/junit-platform-console-standalone.jar -d ./out
            """.trimIndent(),
            runCommand = """
                cd /code && \
                java -jar /usr/share/java/junit-platform-console-standalone.jar \
                    execute \
                    --class-path ./out:/opt/kotlinc/lib/kotlin-stdlib.jar \
                    --select-class Main \
                    --details=tree \
                    --details-theme=ascii
            """.trimIndent()
        )


        "Scala" -> LanguageCommands(
            compileCommand = """
                cd /code && \
                scalac -cp /usr/share/java/junit-platform-console-standalone.jar:/usr/share/scala/lib/scala-library.jar Main.scala
            """.trimIndent(),
            runCommand = """
                cd /code && \
                java -jar /usr/share/java/junit-platform-console-standalone.jar \
                    execute \
                    --class-path .:/usr/share/scala/lib/scala-library.jar \
                    --select-class Main
            """.trimIndent()
        )


        else -> throw IllegalArgumentException("Unsupported language: ${language.name}")
    }
}
