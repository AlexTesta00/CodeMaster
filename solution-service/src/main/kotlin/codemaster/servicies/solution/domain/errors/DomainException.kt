package codemaster.servicies.solution.domain.errors

open class DomainException(message: String) : RuntimeException(message)

class InvalidUserException : DomainException("Invalid user name")

class EmptyCodeException : DomainException("Code cannot be empty")

class InvalidLanguageException : DomainException("Language name or extension cannot be empty")
