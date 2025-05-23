package codemaster.servicies.solution.application.errors

open class ServiceException(message: String) : RuntimeException(message)

class EmptyCodeException : ServiceException("Code cannot be empty")

class EmptyLanguageException : ServiceException("Language name or extension cannot be empty")

class EmptyTestCodeException : ServiceException("Test code cannot be empty")
