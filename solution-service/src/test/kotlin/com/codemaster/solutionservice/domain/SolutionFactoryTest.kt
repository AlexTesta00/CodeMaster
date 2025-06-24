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
        val solved = false
        val codes = listOf((Code(
            language = language,
            code = """
            static String myPrint(String s) {
                return "Hello World! " + s;
            }
        """.trimIndent()
        )))

        val factory = SolutionFactoryImpl()

        describe("TestSolutionFactory") {
            it("should create a new solution correctly") {
                val solution = factory.create(id, user, questId, solved, codes)
                solution.id shouldBe id
                for (code in codes) {
                    code shouldBe code
                    code.language shouldBe language
                }
                solution.codes.first() shouldBe codes.first()
                solution.result shouldBe ExecutionResult.Pending
                solution.questId shouldBe questId
                solution.solved shouldBe false
            }

            it("should fail if the username is invalid") {
                shouldThrow<InvalidUserException> {
                    factory.create(id, "", questId, solved, codes)
                }
            }

            it("should fail if execution code is invalid") {
                val invalidCode = listOf(Code(language, ""))

                shouldThrow<EmptyCodeException> {
                    factory.create(id, user, questId, solved, invalidCode)
                }
            }
        }
    }
}
