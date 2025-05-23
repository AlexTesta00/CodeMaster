import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("com.github.node-gradle.node") version "7.1.0"
}

node{
    version.set("23.5.0")
    npmVersion.set("10.9.2")
    download.set(true)
}

tasks.register<NpmTask>("npmTest"){
    args.set(listOf("run", "test"))
    dependsOn("npmInstall")
}

tasks.register<NpmTask>("build"){
    args.set(listOf("run", "build"))
    dependsOn("npmTest")
}

tasks.register<NpmTask>("lint"){
    args.set(listOf("run", "lint"))
    dependsOn("npmInstall")
}

tasks.register<NpmTask>("prettier"){
    args.set(listOf("run", "prettier"))
    dependsOn("npmInstall")
}

defaultTasks("build")