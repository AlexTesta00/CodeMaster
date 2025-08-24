package codemaster.servicies.solution.infrastructure.docker

import codemaster.servicies.solution.domain.model.Language

data class LanguageCommands(
    val compileCommand: String,
    val compileAndRunCommand: String
)

object LanguageCommandProvider {

    fun getCommandsFor(language: Language): LanguageCommands = when (language.name) {
        "Java" -> LanguageCommands(
            compileCommand = """
                javac -cp /usr/share/java/junit-platform-console-standalone.jar Main.java MainTest.java 
            """.trimIndent(),
            compileAndRunCommand = """
                javac -cp /usr/share/java/junit-platform-console-standalone.jar Main.java MainTest.java && \
                java -jar /usr/share/java/junit-platform-console-standalone.jar \
                    execute \
                    --class-path . \
                    --select-class MainTest 
            """.trimIndent()
        )

        "Kotlin" -> LanguageCommands(
            compileCommand = """
                mkdir -p ./out && \
                kotlinc Main.kt MainTest.kt -cp /usr/share/java/junit-platform-console-standalone.jar -d ./out
            """.trimIndent(),
            compileAndRunCommand = """
                mkdir -p ./out && \
                kotlinc Main.kt MainTest.kt -cp /usr/share/java/junit-platform-console-standalone.jar -d ./out && \
                java -jar /usr/share/java/junit-platform-console-standalone.jar \
                    execute \
                    --class-path ./out:/opt/kotlinc/lib/kotlin-stdlib.jar \
                    --select-class MainTest \
                    --details=tree \
                    --details-theme=ascii
            """.trimIndent()
        )

        "Scala" -> LanguageCommands(
            compileCommand = """
                scalac -cp /usr/share/java/junit-platform-console-standalone.jar:/usr/share/scala/lib/scala-library.jar Main.scala MainTest.scala
            """.trimIndent(),
            compileAndRunCommand = """
                scalac -cp /usr/share/java/junit-platform-console-standalone.jar:/usr/share/scala/lib/scala-library.jar Main.scala MainTest.scala
                java -jar /usr/share/java/junit-platform-console-standalone.jar \
                    execute \
                    --class-path .:/usr/share/scala/lib/scala-library.jar \
                    --select-class MainTest
            """.trimIndent()
        )

        else -> throw IllegalArgumentException("Unsupported language: ${language.name}")
    }
}
