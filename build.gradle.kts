plugins {
    id("com.github.node-gradle.node") version "7.1.0"
}

node{
    version.set("23.5.0")
    npmVersion.set("10.9.2")
    download.set(true)
}

allprojects {
    group = "codemaster"
}

fun findExecutableInPath(executable: String): String? {
    val path = System.getenv("PATH") ?: return null
    val paths = path.split(File.pathSeparator)
    val execName = if (System.getProperty("os.name").lowercase().contains("windows")) "$executable.exe" else executable
    for (dir in paths) {
        val file = File(dir, execName)
        if (file.exists() && file.canExecute()) {
            return file.absolutePath
        }
    }
    return null
}

tasks.register<Exec>("dockerCompose") {
    println("Docker build completed")
    commandLine("docker", "compose", "up")

    dependsOn("buildMultiLangRunner")
}

tasks.register<Exec>("buildMultiLangRunner") {
    val dockerCmd = findExecutableInPath("docker")
        ?: throw GradleException("Docker executable not found in PATH. Please install Docker and ensure it is in your PATH.")

    println("Using docker executable: $dockerCmd")

    val dockerContextDir = File(project.projectDir, "./multi-lang-runner").absolutePath
    commandLine(dockerCmd, "build", "-t", "multi-lang-runner:latest", dockerContextDir)

    doLast {
        println("Docker build completed")
        commandLine("docker", "compose", "up", "--build")
    }
}


subprojects {}

tasks.register("build"){
    dependsOn("npmInstall")
    dependsOn(":codequest-service:build")
    dependsOn(":authentication-service:build")
    dependsOn(":user-service:build")
    dependsOn(":solution-service:build")
    dependsOn(":community-service:build")
    dependsOn(":code-generator-service:build")
}