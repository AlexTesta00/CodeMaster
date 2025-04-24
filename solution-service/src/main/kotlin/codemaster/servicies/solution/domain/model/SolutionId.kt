package codemaster.servicies.solution.domain.model

import org.bson.types.ObjectId

@JvmInline
value class SolutionId(private val value: ObjectId) {
    companion object {
        fun generate(): SolutionId = SolutionId(ObjectId())
        fun fromString(id: String): SolutionId = SolutionId(ObjectId(id))
    }

    override fun toString(): String = value.toHexString()
}