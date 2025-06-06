rootProject.name = "CodeMaster"

plugins {
    id("org.danilopianini.gradle-pre-commit-git-hooks") version "2.0.25"
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

gitHooks {
    commitMsg { conventionalCommits() }
    preCommit { tasks("npmTest", "test") }
    createHooks(true)
}

include("codequest-service")
include("authentication-service")
include("user-service")
include("solution-service")
include("frontend-service")