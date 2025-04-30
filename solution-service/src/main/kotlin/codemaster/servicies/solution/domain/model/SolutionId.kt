package codemaster.servicies.solution.domain.model

import org.springframework.core.convert.converter.Converter
import org.springframework.data.convert.ReadingConverter
import org.springframework.data.convert.WritingConverter
import java.util.UUID

@JvmInline
value class SolutionId(val value: String) {
    companion object {
        fun generate(): SolutionId = SolutionId(UUID.randomUUID().toString())
    }

    override fun toString(): String = value
}

@WritingConverter
class SolutionIdWriter : Converter<SolutionId, String> {
    override fun convert(source: SolutionId): String = source.value
}

@ReadingConverter
class SolutionIdReader : Converter<String, SolutionId> {
    override fun convert(source: String): SolutionId = SolutionId(source)
}
