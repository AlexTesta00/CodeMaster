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
    id("application")
}

group = "com.codemaster"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

tasks.withType<org.springframework.boot.gradle.tasks.bundling.BootJar> {
    mainClass.set("codemaster.services.generator.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.mongodb:mongodb-driver-kotlin-sync:5.1.4")
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")
    implementation("org.springframework.boot:spring-boot-starter-mustache")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-logging")
    implementation("org.springframework.boot:spring-boot-starter-actuator:3.4.5")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb-reactive")
    implementation("org.springframework.boot:spring-boot-starter-amqp")
    implementation("org.apache.commons:commons-compress:1.26.1")
    testImplementation("io.kotest.extensions:kotest-extensions-spring:1.1.2")
    testImplementation("de.flapdoodle.embed:de.flapdoodle.embed.mongo:4.11.0")
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage")
    }
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("io.kotest:kotest-runner-junit5:5.9.1")
    testImplementation("io.kotest:kotest-assertions-core:5.9.1")
    testImplementation("io.kotest:kotest-framework-engine:5.9.0")
    runtimeOnly("org.springframework.boot:spring-boot-devtools")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.bootJar {
    archiveFileName.set("codemaster-generator-service.jar")
}

kover {
    reports {
        total {
            xml {
                onCheck = true
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
    config.setFrom(files("config/detekt/detekt.yml"))
    buildUponDefaultConfig = true
    parallel = true
}

tasks.check {
    dependsOn("detekt")
    dependsOn("koverVerify")
}

tasks.koverVerify {
    dependsOn(tasks.test)
}

tasks.koverXmlReport {
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
    dependsOn("detekt")

    if (!project.hasProperty("skipTests") || project.property("skipTests") != "true") {
        dependsOn(tasks.test)
    }
}
