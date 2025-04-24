package com.codemaster.solution_service.domain

import codemaster.servicies.solution.domain.errors.EmptyCodeException
import codemaster.servicies.solution.domain.errors.InvalidUserException
import codemaster.servicies.solution.domain.model.*
import org.bson.types.ObjectId
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Configuration
import kotlin.test.assertEquals
import kotlin.test.assertNull

internal class SolutionFactoryTest {

    val id = SolutionId.generate()
    val user = "user"
    val questId = ObjectId()
    val language = Language("Java", ".java", "21", "jvm")
    val code = """
        class Solution {
            public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
                
            }
        }
    """.trimIndent()

     private val factory = SolutionFactoryImpl()

    @Test
    fun testSolutionParameters() {
        val solution = factory.create(id, user, questId, language, code)

        assertEquals(solution.id, id)
        assertEquals(solution.code, code)
        assertEquals(solution.result, ExecutionResult.Pending)
        assertEquals(solution.questId, questId)
        assertEquals(solution.language, language)
    }

    @Test
    fun testQuestIdIsEmpty() {
        assertThrows<InvalidUserException> {
            factory.create(id, "", questId, language, code)
        }
    }

    @Test
    fun testSolutionCodeIsEmpty() {
        assertThrows<EmptyCodeException> {
            factory.create(id, user, questId, language, "")
        }
    }

}