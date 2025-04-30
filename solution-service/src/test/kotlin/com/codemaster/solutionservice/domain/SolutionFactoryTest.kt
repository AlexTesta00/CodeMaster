package com.codemaster.solutionservice.domain

import codemaster.servicies.solution.domain.errors.EmptyCodeException
import codemaster.servicies.solution.domain.errors.InvalidUserException
import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Language
import codemaster.servicies.solution.domain.model.SolutionFactoryImpl
import codemaster.servicies.solution.domain.model.SolutionId
import io.kotest.core.spec.style.DescribeSpec
import org.bson.types.ObjectId
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals

internal class SolutionFactoryTest : DescribeSpec() {
    init {
        val id = SolutionId.generate()
        val user = "user"
        val questId = ObjectId()
        val language = Language("Java", ".java", "21", "jvm")
        val code =
            """
            class Solution {
                public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
                    
                }
            }
            """.trimIndent()

        val factory = SolutionFactoryImpl()

        describe("TestSOlutionFactory") {
            it("should create a new solution correctly") {
                val solution = factory.create(id, user, questId, language, code)

                assertEquals(solution.id, id)
                assertEquals(solution.code, code)
                assertEquals(solution.result, ExecutionResult.Pending)
                assertEquals(solution.questId, questId)
                assertEquals(solution.language, language)
            }

            it("should fail if the username is invalid") {
                assertThrows<InvalidUserException> {
                    factory.create(id, "", questId, language, code)
                }
            }

            it("should fail if execution code is invalid") {
                assertThrows<EmptyCodeException> {
                    factory.create(id, user, questId, language, "")
                }
            }
        }
    }
}
