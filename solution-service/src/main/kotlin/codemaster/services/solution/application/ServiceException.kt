package codemaster.services.solution.application

open class ServiceException(message: String) : RuntimeException(message)

class EmptyCodeException : ServiceException("Code cannot be empty")
