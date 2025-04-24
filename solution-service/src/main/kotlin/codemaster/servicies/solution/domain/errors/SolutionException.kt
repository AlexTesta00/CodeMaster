package codemaster.servicies.solution.domain.errors

open class DomainException(message: String) : RuntimeException(message)

// Custom exceptions for specific fields
class InvalidUserException(problemId: String) : DomainException("Invalid ProblemId: $problemId")
class EmptyCodeException : DomainException("Code cannot be empty")