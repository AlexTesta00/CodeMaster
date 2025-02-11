allprojects {
    group = "codemaster"
}

subprojects {}

tasks.register("build"){
    dependsOn(":authentication-service:build")
}