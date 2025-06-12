import com.bmuschko.gradle.docker.tasks.container.*
import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("com.github.node-gradle.node") version "7.1.0"
    id("com.bmuschko.docker-remote-api") version "9.4.0"
}

node {
    version.set("23.5.0")
    npmVersion.set("10.9.2")
    download.set(true)
}

val createRabbitMQContainer = tasks.register<DockerCreateContainer>("createRabbitMQContainer") {
    targetImageId("rabbitmq:3-management")
    containerName.set("test-rabbitmq-codequest")
    hostConfig.portBindings.set(listOf("5673:5672", "15673:15672"))
}

val startRabbitMQ = tasks.register<DockerStartContainer>("startRabbitMQ") {
    dependsOn(createRabbitMQContainer)
    targetContainerId(createRabbitMQContainer.get().containerId)
}

val stopRabbitMQ = tasks.register<DockerStopContainer>("stopRabbitMQ") {
    targetContainerId(createRabbitMQContainer.get().containerId)
    onlyIf { createRabbitMQContainer.get().containerId != null }
}

val removeRabbitMQContainer = tasks.register<DockerRemoveContainer>("removeRabbitMQContainer") {
    doFirst {
        println("⏳ Waiting for RabbitMQ to stop...")
        Thread.sleep(2000)
    }
    dependsOn(stopRabbitMQ)
    targetContainerId(createRabbitMQContainer.get().containerId)
    force.set(true)
}

tasks.register<NpmTask>("npmTest") {
    dependsOn("npmInstall", startRabbitMQ)
    finalizedBy(removeRabbitMQContainer)

    doFirst {
        println("⏳ Waiting for RabbitMQ...")
        Thread.sleep(10000)
    }

    args.set(listOf("run", "test"))
}

tasks.register<NpmTask>("build") {
    args.set(listOf("run", "build"))
    dependsOn("npmTest")
}

tasks.register<NpmTask>("lint") {
    args.set(listOf("run", "lint"))
    dependsOn("npmInstall")
}

tasks.register<NpmTask>("prettier") {
    args.set(listOf("run", "prettier"))
    dependsOn("npmInstall")
}

defaultTasks("build")
