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

subprojects {}

tasks.register("build"){
    dependsOn("npmInstall")
    dependsOn(":codequest-services:build")
}