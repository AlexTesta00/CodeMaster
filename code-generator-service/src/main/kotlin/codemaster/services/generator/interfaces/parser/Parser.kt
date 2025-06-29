package codemaster.services.generator.interfaces.parser

import codemaster.services.generator.domain.TypeName
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper

object Parser {

    val objectMapper = ObjectMapper()

    fun parseValue(value: String, expectedType: TypeName): Any? {
        if (value == "null") return null

        val rawType = expectedType.raw

        if ((rawType.startsWith("List<") && value.startsWith("[")) ||
            (rawType.startsWith("Map<") && value.startsWith("{"))) {
            val normalized = normalizeInput(value, expectedType)
            val jsonNode: JsonNode = objectMapper.readTree(normalized)
            return parseJsonNode(jsonNode, expectedType)
        }

        return when (rawType) {
            "int", "Int" -> value.toInt()
            "double", "Double" -> value.toDouble()
            "string", "String" -> value.removeSurrounding("\"")
            else -> value.removeSurrounding("\"")
        }
    }

    fun parseJsonNode(node: JsonNode, expectedType: TypeName): Any? {
        val rawType = expectedType.raw

        return when {
            rawType.startsWith("List<") -> {
                if (!node.isArray) error("Expected JSON array but got $node")
                val innerType = TypeName(rawType.removePrefix("List<").removeSuffix(">"))
                node.map { parseJsonNode(it, innerType) }
            }
            rawType.startsWith("Map<") -> {
                if (!node.isObject) error("Expected JSON object but got $node")
                val innerTypes = rawType.removePrefix("Map<").removeSuffix(">").split(",")
                val keyType = TypeName(innerTypes[0].trim())
                val valueType = TypeName(innerTypes[1].trim())

                node.fields().asSequence().associate { (key, valueNode) ->
                    parseJsonNode(objectMapper.readTree("\"$key\""), keyType) to parseJsonNode(valueNode, valueType)
                }
            }
            rawType == "int" || rawType == "Int" -> node.asInt()
            rawType == "double" || rawType == "Double" -> node.asDouble()
            rawType == "string" || rawType == "String" -> node.asText()
            else -> node.asText()
        }
    }

    fun normalizeInput(value: String, expectedType: TypeName): String {
        val raw = expectedType.raw.lowercase()
        return when {
            raw.startsWith("list<") -> value.replace("(", "[").replace(")", "]")
            raw.startsWith("map<") -> {
                value.trim('{', '}')
                    .split(",")
                    .joinToString(prefix="{", postfix="}") { entry ->
                        val parts = entry.split(":")
                        val key = parts[0].trim().replace("(", "[").replace(")", "]")
                        val val_ = parts[1].trim().replace("(", "[").replace(")", "]")
                        "\"$key\":\"$val_\""
                    }
            }
            else -> value
        }
    }
}
