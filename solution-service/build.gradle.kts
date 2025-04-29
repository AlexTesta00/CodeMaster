import kotlinx.kover.gradle.plugin.dsl.AggregationType
import kotlinx.kover.gradle.plugin.dsl.CoverageUnit
import kotlinx.kover.gradle.plugin.dsl.GroupingEntityType

plugins {
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.spring") version "2.0.21"
    id("org.springframework.boot") version "3.4.4"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.jetbrains.kotlinx.kover") version "0.9.1"
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
    id("org.jlleitschuh.gradle.ktlint") version "11.6.0"
}

group = "com.codemaster"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.mongodb:mongodb-driver-kotlin-sync:5.1.4")
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-mustache")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    runtimeOnly("org.springframework.boot:spring-boot-devtools")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

kover {
    reports {
        total {
            xml {
                onCheck = true // Generate the XML report after running tests
            }
            log {
                onCheck = true
                header = "Custom Coverage Header"
                format = "<entity> line coverage: <value>%"
                groupBy = GroupingEntityType.CLASS
                coverageUnits = CoverageUnit.LINE
                aggregationForGroup = AggregationType.COVERED_PERCENTAGE
            }
            verify {
                rule {
                    bound {
                        coverageUnits.set(CoverageUnit.LINE)
                        aggregationForGroup.set(AggregationType.COVERED_PERCENTAGE)
                    }
                }
            }
        }
    }
}

detekt {
    config.setFrom(files("config/detekt/detekt.yml")) // Optional config file
    buildUponDefaultConfig = true
    parallel = true
}

ktlint {
    version.set("1.2.1") // match your project's ktlint version
    verbose.set(true)
    outputToConsole.set(true)
    ignoreFailures.set(false)
    reporters {
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.PLAIN)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.CHECKSTYLE)
    }
}

tasks.check {
    dependsOn("detekt")
    dependsOn("ktlintCheck")
    dependsOn("koverVerify")
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    enabled = false
}

tasks.koverVerify {
    dependsOn(tasks.test)
}

tasks.koverXmlReport {
    // Ensure this task depends on the test task, but without introducing circular dependencies
    dependsOn(tasks.test)
}

tasks.test {
    outputs.upToDateWhen { false }
    outputs.cacheIf { false }

    useJUnitPlatform()

    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
        showCauses = true
        showExceptions = true
        showStackTraces = true
        showStandardStreams = true
    }

    finalizedBy(tasks.koverLog)
    finalizedBy(tasks.koverXmlReport)
}

tasks.build {
    dependsOn(tasks.test)
    dependsOn("ktlintCheck")
    dependsOn("detekt")
}
