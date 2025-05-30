package com.codemaster.solutionservice.domain

import codemaster.servicies.solution.domain.errors.EmptyCodeException
import codemaster.servicies.solution.domain.errors.InvalidUserException
import codemaster.servicies.solution.domain.model.*
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe

internal class SolutionFactoryTest : DescribeSpec() {
    init {
        val id = SolutionId.generate()
        val user = "user"
        val questId = "test"
        val language = Language("Java", ".java")
        val difficulty = Difficulty.Medium
        val solved = false
        val testCode = """
            @Test
            void testFunction1() {
                assertEquals("Hello World! test", Main.myPrint("test"));
            }
        """.trimIndent()
        val code = """
            static String myPrint(String s) {
                return "Hello World! " + s;
            }
        """.trimIndent()

        val factory = SolutionFactoryImpl()

        describe("TestSolutionFactory") {
            it("should create a new solution correctly") {
                val solution = factory.create(id, user, questId, language, difficulty, solved, code, testCode)

                solution.id shouldBe id
                solution.code shouldBe code
                solution.result shouldBe ExecutionResult.Pending
                solution.questId shouldBe questId
                solution.testCode shouldBe testCode
                solution.difficulty shouldBe difficulty
                solution.solved shouldBe false
                solution.language shouldBe language
            }

            it("should fail if the username is invalid") {
                shouldThrow<InvalidUserException> {
                    factory.create(id, "", questId, language, difficulty, solved, code, testCode)
                }
            }

            it("should fail if execution code is invalid") {
                shouldThrow<EmptyCodeException> {
                    factory.create(id, user, questId, language, difficulty, solved,"", testCode)
                }
            }

            it("should fail if test code is invalid") {
                shouldThrow<EmptyCodeException> {
                    factory.create(id, user, questId, language, difficulty, solved, code, "")
                }
            }

            it("should fail if the difficulty does not exist") {
                shouldThrow<IllegalArgumentException> {
                    factory.create(id, user, questId, language, Difficulty.from("ultra"), solved, code, testCode)
                }
            }
        }
    }
}
