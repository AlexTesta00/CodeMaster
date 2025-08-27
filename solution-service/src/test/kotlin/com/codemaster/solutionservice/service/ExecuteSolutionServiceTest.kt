package com.codemaster.solutionservice.service

import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.infrastructure.SolutionRepository
import codemaster.servicies.solution.infrastructure.docker.DockerRunner
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.types.shouldBeTypeOf
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.TestInstance
import reactor.core.publisher.Mono
import java.nio.file.Path

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ExecuteSolutionServiceTest : DescribeSpec(){

    data class LanguageCase(
        val language: Language,
        val code: String,
        val testCode: String,
        val failingTestCode: String,
        val runtimeExceptionCode: String,
        val runtimeTestCode: String,
        val infiniteLoopCode: String,
    )

    val javaCase = LanguageCase(
        Language("Java", ".java"),
        """static String myPrint(String s) { return "Hello World! " + s; }""",
        """
        @Test void testFunction1() {
            assertEquals("Hello World! test", Main.myPrint("test"));
        }
        @Test void testFunction2() {
            assertEquals("Hello World! test", Main.myPrint("test"));
        }
    """.trimIndent(),
        """
        @Test void testFunction1() {
            assertEquals("Hello World! test", Main.myPrint("test"));
        }
        @Test void testFunction2() {
            assertEquals("Hello World! test", Main.myPrint(""));
        }
    """.trimIndent(),
        """static String myPrint(String input) { return input.toUpperCase(); }""",
        """@Test void testFunction1() { assertEquals("test", Main.myPrint(null)); }""",
        """static Void myPrint(String s) { while(true) {} }"""
    )

    val scalaCase = LanguageCase(
        Language("Scala", ".scala"),
        """object Main { def myPrint(s: String) = "Hello World! " + s }""",
        """
        test("testFunction1") {
            assert(Main.myPrint("test") == "Hello World! test")
        }
        test("testFunction2") {
            assert(Main.myPrint("test") == "Hello World! test")
        }
    """.trimIndent(),
        """
        test("testFunction1") {
            assert(Main.myPrint("test") == "Hello World! test")
        }
        test("testFunction2") {
            assert(Main.myPrint("") == "Hello World! test")
        }
    """.trimIndent(),
        """object Main { def myPrint(s: String) = s.toUpperCase }""",
        """test("testFunction1") { assert(Main.myPrint(null) == "test") }""",
        """object Main { def myPrint(s: String): Unit = while(true) {} }"""
    )

    val kotlinCase = LanguageCase(
        Language("Kotlin", ".kt"),
        """object Main { fun myPrint(s: String) = "Hello World! " + s }""",
        """
        @Test fun testFunction1() {
            assertEquals("Hello World! test", Main.myPrint("test"))
        }
        @Test fun testFunction2() {
            assertEquals("Hello World! test", Main.myPrint("test"))
        }
    """.trimIndent(),
        """
        @Test fun testFunction1() {
            assertEquals("Hello World! test", Main.myPrint("test"))
        }
        @Test fun testFunction2() {
            assertEquals("Hello World! test", Main.myPrint(""))
        }
    """.trimIndent(),
        """object Main { fun myPrint(s: String) = s.toUpperCase() }""",
        """@Test fun testFunction1() { assertEquals("test", Main.myPrint(null)) }""",
        """object Main { fun myPrint(s: String): Nothing { while(true) {} } }"""
    )

    val languageCases = listOf(javaCase, scalaCase, kotlinCase)

    val repository = mockk<SolutionRepository>()
    val dockerRunner = mockk<DockerRunner>()
    val service = SolutionService(repository, dockerRunner)
    val id = SolutionId.generate()
    val dummyPath = mockk<Path>()

    init {

        languageCases.forEach { case ->

            val solution = SolutionFactoryImpl()
                .create(
                    id,
                    "user",
                    "questId",
                    false,
                    listOf(Code(case.language, case.code))
                )

            beforeEach {
                every { repository.updateCode(id, any(), any()) } returns monoOf(solution)
                every { repository.updateSolved(id, any()) } returns monoOf(solution)
                every { repository.updateResult(id, any()) } returns monoOf(solution)
                every { repository.findSolutionById(id) } returns monoOf(solution)
                coEvery { dockerRunner.prepareCodeDir(case.language, any(), any()) } returns dummyPath
                every {
                    dockerRunner.parseJUnitConsoleOutput(any())
                } answers {
                    firstArg<String>().lines().filter { it.isNotBlank() }
                }
            }

            describe("${case.language.name}ExecutionService") {

                val solution = SolutionFactoryImpl().create(
                    id, "user", "questId", false, listOf(Code(case.language, case.code))
                )

                beforeEach {
                    every { repository.findSolutionById(id) } returns monoOf(solution)
                }

                it("should compile code successfully in ${case.language.name}") {
                    coEvery {
                        dockerRunner.runDocker(
                            any(),
                            any(),
                            any(),
                            any(),
                            any()
                        )
                    } returns ExecutionResult.Accepted(emptyList(), 0)

                    val result = service.compileSolution(id, case.language, case.code, case.testCode)
                    result shouldBe ExecutionResult.Accepted(emptyList(), 0)
                }

                it("should execute code and return all test functions passed in ${case.language.name}") {
                    val expectedResult = ExecutionResult.Accepted(
                        listOf("testFunction1() [OK]", "testFunction2() [OK]"), 0
                    )

                    coEvery { dockerRunner.runDocker(any(), any(), any(), any(), any()) } answers {
                        val phase = arg<String>(3)
                        val callback = arg<(Int, String, String) -> ExecutionResult>(4)
                        when (phase) {
                            "compile" -> callback(0, "", "")
                            "run" -> callback(0, "testFunction1() [OK]\ntestFunction2() [OK]", "")
                            else -> ExecutionResult.Pending
                        }
                    }

                    every { repository.updateSolved(id, true) } returns monoOf(
                        solution.copy(
                            result = expectedResult,
                            solved = true
                        )
                    )
                    every {
                        repository.updateResult(
                            id,
                            expectedResult
                        )
                    } returns monoOf(solution.copy(result = expectedResult, solved = true))

                    val result = service.executeSolution(id, case.language, case.code, case.testCode)
                    result.result shouldBe expectedResult
                    result.solved shouldBe true
                }

                it("should execute code and return some test functions failed in ${case.language.name}") {
                    val expectedResult = ExecutionResult.TestsFailed(
                        "",
                        listOf(
                            "testFunction1() [OK]",
                            "testFunction2() [X] expected: <Hello World! test> but was: <Hello World! >"
                        ),
                        1
                    )

                    coEvery { dockerRunner.runDocker(any(), any(), any(), any(), any()) } answers {
                        val phase = arg<String>(3)
                        val callback = arg<(Int, String, String) -> ExecutionResult>(4)
                        when (phase) {
                            "compile" -> callback(0, "", "")
                            "run" -> expectedResult
                            else -> ExecutionResult.Pending
                        }
                    }

                    every { repository.updateSolved(id, false) } returns monoOf(
                        solution.copy(
                            result = expectedResult,
                            solved = false
                        )
                    )
                    every {
                        repository.updateResult(
                            id,
                            expectedResult
                        )
                    } returns monoOf(solution.copy(result = expectedResult, solved = false))

                    val result = service.executeSolution(id, case.language, case.code, case.failingTestCode)

                    result.result.shouldBeTypeOf<ExecutionResult.TestsFailed>().also {
                        it.output shouldBe expectedResult.output
                        it.exitCode shouldBe 1
                    }
                    result.solved shouldBe false
                }

                it("should fail if the compilation is not successful in ${case.language.name}") {
                    val nonCompilingCode = case.code.dropLast(5) // tronco per simulare errore

                    coEvery {
                        dockerRunner.runDocker(any(), any(), any(), any(), any())
                    } returns ExecutionResult.CompileFailed(
                        "",
                        "error: reached end of file\nMain${case.language.fileExtension}",
                        1
                    )

                    val result = service.compileSolution(id, case.language, nonCompilingCode, case.testCode)

                    result.shouldBeTypeOf<ExecutionResult.CompileFailed>().also {
                        it.stderr shouldContain "error: reached end of file"
                        it.stderr shouldContain "Main${case.language.fileExtension}"
                        it.exitCode shouldBe 1
                    }
                }

                it("should fail execution if there is a runtime exception in ${case.language.name}") {
                    val expectedResult = ExecutionResult.TestsFailed(
                        "testFunction1() [X] NullPointerException",
                        listOf(""),
                        1
                    )

                    coEvery { dockerRunner.runDocker(any(), any(), any(), any(), any()) } answers {
                        val phase = arg<String>(3)
                        val callback = arg<(Int, String, String) -> ExecutionResult>(4)
                        when (phase) {
                            "compile" -> callback(0, "", "")
                            "run" -> expectedResult
                            else -> ExecutionResult.Pending
                        }
                    }

                    every { repository.updateSolved(id, false) } returns monoOf(
                        solution.copy(
                            result = expectedResult,
                            solved = false
                        )
                    )
                    every {
                        repository.updateResult(
                            id,
                            expectedResult
                        )
                    } returns monoOf(solution.copy(result = expectedResult, solved = false))

                    val result =
                        service.executeSolution(id, case.language, case.runtimeExceptionCode, case.runtimeTestCode)

                    result.result.shouldBeTypeOf<ExecutionResult.TestsFailed>().also {
                        it.output shouldBe expectedResult.output
                        it.exitCode shouldBe 1
                    }
                    result.solved shouldBe false
                }

                it("should exceed timeout if execution is too heavy in ${case.language.name}") {
                    val expectedResult = ExecutionResult.TimeLimitExceeded(20_000)

                    coEvery { dockerRunner.runDocker(any(), any(), any(), any(), any()) } answers {
                        val phase = arg<String>(3)
                        val callback = arg<(Int, String, String) -> ExecutionResult>(4)
                        when (phase) {
                            "compile" -> callback(0, "", "")
                            "run" -> expectedResult
                            else -> ExecutionResult.Pending
                        }
                    }

                    every {
                        repository.updateResult(
                            id,
                            expectedResult
                        )
                    } returns monoOf(solution.copy(result = expectedResult))

                    val result = service.executeSolution(id, case.language, case.infiniteLoopCode, case.testCode)

                    result.result shouldBe expectedResult
                }

                it("should throw exception if there is no solution with given id in ${case.language.name}") {
                    val fakeId = SolutionId.generate()
                    every { repository.updateCode(fakeId, any(), any()) } returns monoOf(null)

                    shouldThrow<NoSuchElementException> {
                        service.executeSolution(fakeId, case.language, case.code, case.testCode)
                    }
                    shouldThrow<NoSuchElementException> {
                        service.compileSolution(fakeId, case.language, case.code, case.testCode)
                    }
                }
            }
        }
    }
}

private fun <T> monoOf(value: T?): Mono<T> =
    if (value != null) Mono.just(value)
    else Mono.empty()
