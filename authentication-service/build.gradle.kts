import com.github.gradle.node.npm.task.NpmTask
import com.bmuschko.gradle.docker.tasks.container.*
import com.bmuschko.gradle.docker.tasks.image.DockerPullImage

plugins {
    id("com.github.node-gradle.node") version "7.1.0"
    id("com.bmuschko.docker-remote-api") version "9.4.0"
}

node{
    version.set("23.5.0")
    npmVersion.set("10.9.2")
    download.set(true)
}

val pullRabbitMQImage = tasks.register<DockerPullImage>("pullRabbitMQImage") {
    image.set("rabbitmq:4-management")
}

// Task per creare il container RabbitMQ
val createRabbitMQContainer = tasks.register<DockerCreateContainer>("createRabbitMQContainer") {
    dependsOn(pullRabbitMQImage)
    targetImageId("rabbitmq:4-management")
    containerName.set("test-rabbitmq")
    hostConfig.portBindings.set(listOf("5672:5672", "15672:15672"))
}

// Task per avviare il container
val startRabbitMQ = tasks.register<DockerStartContainer>("startRabbitMQ") {
    dependsOn(createRabbitMQContainer)
    targetContainerId(createRabbitMQContainer.get().containerId)
}

// Task per fermare RabbitMQ
val stopRabbitMQ = tasks.register<DockerStopContainer>("stopRabbitMQ") {
    targetContainerId(createRabbitMQContainer.get().containerId)
    onlyIf { createRabbitMQContainer.get().containerId != null }
}

// Task per rimuovere il container
val removeRabbitMQContainer = tasks.register<DockerRemoveContainer>("removeRabbitMQContainer") {
    doFirst {
        println("⏳ Waiting for RabbitMQ to stop...")
        Thread.sleep(2000)
    }
    dependsOn(stopRabbitMQ)
    targetContainerId(createRabbitMQContainer.get().containerId)
    force.set(true)
}

// Task npmTest con RabbitMQ
tasks.register<NpmTask>("npmTest") {
    dependsOn("npmInstall", startRabbitMQ)
    finalizedBy(removeRabbitMQContainer)

    doFirst {
        println("⏳ Waiting for RabbitMQ...")
        Thread.sleep(10000)
    }

    environment.set(mapOf("RABBIT_URL" to "amqp://guest:guest@host.docker.internal"))
    args.set(listOf("run", "test"))
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