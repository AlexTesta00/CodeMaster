package codemaster.services.generator.domain

data class TypeName(val raw: String) {

    fun mapTo(language: Language): String {
        val mapper: (String) -> String = when (language) {
            Language.Kotlin -> ::mapBaseToKotlin
            Language.Java -> ::mapBaseToJava
            Language.Scala -> ::mapBaseToScala
        }
        return parseAndMapType(raw.trim(), mapper)
    }

    private fun parseAndMapType(type: String, mapBase: (String) -> String): String {
        val trimmed = type.trim()

        if (trimmed.startsWith("Map<")) {
            val inner = trimmed.removePrefix("Map<").removeSuffix(">")
            val (keyType, valueType) = splitGenericArguments(inner)
            return "${mapBase("Map")}<${parseAndMapType(keyType, mapBase)}, ${parseAndMapType(valueType, mapBase)}>"
        }

        if (trimmed.startsWith("List<")) {
            val inner = trimmed.removePrefix("List<").removeSuffix(">")
            return "${mapBase("List")}<${parseAndMapType(inner, mapBase)}>"
        }

        if (trimmed.endsWith("[]")) {
            val elementType = trimmed.removeSuffix("[]")
            return when (mapBase(elementType)) {
                "int" -> "int[]"
                "String" -> "String[]"
                else -> "${mapBase(elementType)}[]"
            }
        }

        return mapBase(trimmed)
    }

    private fun splitGenericArguments(s: String): Pair<String, String> {
        var depth = 0
        val splitIndex = s.indexOfFirst { c ->
            if (c == '<') depth++
            else if (c == '>') depth--
            depth == 0 && c == ','
        }
        require(splitIndex != -1)
        val first = s.substring(0, splitIndex).trim()
        val second = s.substring(splitIndex + 1).trim()
        return first to second
    }

    private fun mapBaseToKotlin(base: String): String = when (base) {
        "int" -> "Int"
        "double" -> "Double"
        "string" -> "String"
        "boolean" -> "Boolean"
        else -> base
    }

    private fun mapBaseToJava(base: String): String = when (base) {
        "string" -> "String"
        else -> base
    }

    private fun mapBaseToScala(base: String): String = when (base) {
        "int" -> "Int"
        "double" -> "Double"
        "string" -> "String"
        "boolean" -> "Boolean"
        else -> base
    }
}
