package codemaster.servicies.generator.domain

data class TypeName(val raw: String) {

    fun mapTo(language: Language): String = when (language) {
        Language.Kotlin -> mapToKotlin()
        Language.Java -> mapToJava()
        Language.Scala -> mapToScala()
    }

    private fun mapToKotlin(): String = raw
        .replace("int", "Int")
        .replace("string", "String")
        .replace("int[]", "IntArray")
        .replace("List<", "List<")

    private fun mapToJava(): String = raw
        .replace("int", "int")
        .replace("string", "String")
        .replace("int[]", "int[]")
        .replace("List<", "List<")

    private fun mapToScala(): String = raw
        .replace("int", "Int")
        .replace("string", "String")
        .replace("int[]", "Array[Int]")
        .replace("List<", "List[")
        .replace(">", "]")
}
