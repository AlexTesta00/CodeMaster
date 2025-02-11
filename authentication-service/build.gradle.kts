plugins{
    id("com.github.node-gradle.node") version "7.1.0"
    id("io.github.zucchero-sintattico.typescript-gradle-plugin") version "4.5.0"
}



typescript{
    buildCommandExecutable = BuildCommandExecutable.NPM
    buildCommand = "run build"
    tsconfigFile = file("tsconfig.json")
}

node{
    version.set("23.5.0")
    npmVersion.set("10.9.2")
    download.set(true)
}


tasks.register<NpmTask>("npmTest") {
    args.set(listOf("test"))
    dependsOn("npmInstall")
}


tasks.register<NpmTask>("npmStart") {
    args.set(listOf("start"))
}


tasks.register<NpmTask>("npmBuild") {
    args.set(listOf("run", "build"))
    dependsOn("compileTypeScript")
    dependsOn("npmTest")
}


defaultTasks("npmBuild")