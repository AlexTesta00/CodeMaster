rootProject.name = "CodeMaster"

plugins {
    id("org.danilopianini.gradle-pre-commit-git-hooks") version "2.0.22"
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.10.0"
}

gitHooks {
    commitMsg { conventionalCommits() }
    preCommit { tasks("npmTest") }
    createHooks(true)
}

include("codequest-service")
include("authentication-service")
include("user-service")