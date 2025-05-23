package com.codemaster.solutionservice.domain

import codemaster.servicies.solution.domain.errors.EmptyCodeException
import codemaster.servicies.solution.domain.errors.InvalidUserException
import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Language
import codemaster.servicies.solution.domain.model.SolutionFactoryImpl
import codemaster.servicies.solution.domain.model.SolutionId
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe

internal class SolutionFactoryTest : DescribeSpec() {
    init {
        val id = SolutionId.generate()
        val user = "user"
        val questId = "test"
        val language = Language("Java", ".java")
        val testCode = """
            String test1 = "test1";
            System.out.println(print(test1));
            String test2 = "test2";
            System.out.println(print(test2));
        """.trimIndent()
        val code = """
            private String print(String s) {
                return "Hello World! " + s;
            }
        """.trimIndent()

        val factory = SolutionFactoryImpl()

        describe("TestSolutionFactory") {
            it("should create a new solution correctly") {
                val solution = factory.create(id, user, questId, language, code, testCode)

                solution.id shouldBe id
                solution.code shouldBe code
                solution.result shouldBe ExecutionResult.Pending
                solution.questId shouldBe questId
                solution.language shouldBe language
            }

            it("should fail if the username is invalid") {
                shouldThrow<InvalidUserException> {
                    factory.create(id, "", questId, language, code, testCode)
                }
            }

            it("should fail if execution code is invalid") {
                shouldThrow<EmptyCodeException> {
                    factory.create(id, user, questId, language, "", testCode)
                }
            }

            it("should fail if test code is invalid") {
                shouldThrow<EmptyCodeException> {
                    factory.create(id, user, questId, language, code, "")
                }
            }
        }
    }
}
