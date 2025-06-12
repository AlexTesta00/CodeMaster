package codemaster.servicies.solution.interfaces

import ch.qos.logback.core.model.Model
import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.application.errors.EmptyCodeException
import codemaster.servicies.solution.application.errors.EmptyLanguageException
import codemaster.servicies.solution.domain.errors.DomainException
import codemaster.servicies.solution.domain.model.*
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/solutions")
class SolutionController(private val service: SolutionService) {

    @GetMapping("/health", produces = ["application/json"])
    suspend fun healthCheck(): ResponseEntity<Map<String, Any>> {
        val mongoReady = try {
            service.pingMongo()
            true
        } catch (e: Exception) {
            false
        }

        return if (mongoReady) {
            ResponseEntity.ok(
                mapOf(
                    "status" to "OK",
                    "success" to true
                )
            )
        } else {
            ResponseEntity.internalServerError().body(
                mapOf(
                    "status" to "Service Unavailable",
                    "success" to false,
                    "mongo" to mongoReady
                )
            )
        }
    }


    @PostMapping("/", produces = ["application/json"])
    suspend fun addSolution(@RequestBody request: SolutionDTORequest): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.addSolution(
                SolutionId.generate(),
                request.user,
                request.questId,
                Language(request.language.name, request.language.fileExtension),
                Difficulty.from(request.difficulty),
                request.solved,
                request.code,
                request.testCode
            )
        } catch(ex: DomainException) {
            return ResponseEntity.badRequest().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @GetMapping("/{id}", produces = ["application/json"])
    suspend fun getSolution(@PathVariable id: SolutionId): ResponseEntity<Solution?> {
        val solution: Solution
        try {
            solution = service.getSolution(id)
        } catch(ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                else -> throw ex
            }
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @GetMapping("codequests/{questId}", produces = ["application/json"])
    suspend fun getSolutionsByCodeQuest(@PathVariable questId: String): ResponseEntity<List<Solution>?> {
        val solutions : List<Solution>

        try {
            solutions = service.getSolutionsByQuestId(questId)
        } catch(ex: NoSuchElementException) {
            return ResponseEntity.internalServerError().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solutions)
    }

    @GetMapping("/solved/{user}")
    suspend fun getSolvedSolutionsByUser(
        @PathVariable user: String
    ): ResponseEntity<List<Solution>?> {
        val solutions : List<Solution>

        try {
            solutions = service.getSolvedSolutionsByUser(user)
        } catch(ex: NoSuchElementException) {
            return ResponseEntity.internalServerError().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solutions)
    }

    @GetMapping("/difficulty/{user}")
    suspend fun getSolutionsByUserAndDifficulty(
        @PathVariable user: String,
        @RequestParam difficulty: String
    ): ResponseEntity<List<Solution>> {
        return try {
            val solutions = service.getSolutionsByUserAndDifficulty(user, Difficulty.from(difficulty))
            ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solutions)
        } catch (ex: NoSuchElementException) {
            ResponseEntity.internalServerError().build()
        }
    }

    @GetMapping("users/{user}")
    suspend fun getSolutionsByUser(
        @PathVariable user: String
    ): ResponseEntity<List<Solution>?> {
        val solutions : List<Solution>

        try {
            solutions = service.getSolutionsByUser(user)
        } catch(ex: NoSuchElementException) {
            return ResponseEntity.internalServerError().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solutions)
    }

    @GetMapping("/language/{questId}", produces = ["application/json"])
    suspend fun getSolutionsByLanguage(
        @RequestParam name : String?,
        @RequestParam extension : String?,
        @PathVariable questId: String
    ): ResponseEntity<List<Solution>?> {
        val solutions : List<Solution>

        if (name == null || extension == null) {
            return ResponseEntity.badRequest().build()
        }

        val language = Language(name, extension)
        try {
            solutions = service.getSolutionsByLanguage(language, questId)
        } catch (ex: EmptyLanguageException) {
            return ResponseEntity.badRequest().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solutions)
    }

    @PutMapping("/difficulty/{id}", produces = ["application/json"])
    suspend fun changeSolutionDifficulty(
        @PathVariable id : SolutionId,
        @RequestParam difficulty: String
    ): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.modifySolutionDifficulty(id, Difficulty.from(difficulty))
        } catch (ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                else -> throw ex
            }
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @PutMapping("/language/{id}", produces = ["application/json"])
    suspend fun changeSolutionLanguage(
        @PathVariable id : SolutionId,
        @RequestBody newLanguage: LanguageDTORequest
    ): ResponseEntity<Solution?> {
        val language = Language(newLanguage.name, newLanguage.fileExtension)
        val solution : Solution
        try {
            solution = service.modifySolutionLanguage(id, language)
        } catch (ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                is EmptyLanguageException -> ResponseEntity.badRequest().build()
                else -> throw ex
            }
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @PutMapping("/code/{id}", produces = ["application/json"])
    suspend fun changeSolutionCode(
        @PathVariable id: SolutionId,
        @RequestBody newCode: String
    ): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.modifySolutionCode(id, newCode)
        } catch (ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                is EmptyCodeException -> ResponseEntity.badRequest().build()
                else -> throw ex
            }
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @PutMapping("/test-code/{id}", produces = ["application/json"])
    suspend fun changeSolutionTestCode(
        @PathVariable id: SolutionId,
        @RequestBody newTestCode: String
    ): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.modifySolutionTestCode(id, newTestCode)
        } catch (ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                is EmptyCodeException -> ResponseEntity.badRequest().build()
                else -> throw ex
            }
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @PutMapping("/execute/{id}", produces = ["application/json"])
    suspend fun executeSolutionCode(
        @PathVariable id : SolutionId,
        @RequestBody newCode: String
    ): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.executeSolution(id, newCode)
        } catch (ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                is EmptyCodeException -> ResponseEntity.badRequest().build()
                else -> ResponseEntity.internalServerError().build()
            }
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @PutMapping("/compile/{id}", produces = ["application/json"])
    suspend fun compileSolutionCode(
        @PathVariable id: SolutionId,
        @RequestBody newCode: String
    ): ResponseEntity<ExecutionResult> {
        val logger = LoggerFactory.getLogger(this::class.java)
        return try {
            val result = service.compileSolution(id, newCode)
            ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result)
        } catch (ex: Exception) {
            logger.error("Error compiling solution with id=$id", ex)
            when (ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                is EmptyCodeException -> ResponseEntity.badRequest().build()
                else -> ResponseEntity.internalServerError().build()
            }
        }
    }


    @DeleteMapping("/{id}", produces = ["application/json"])
    suspend fun deleteSolution(@PathVariable id: SolutionId): ResponseEntity<Solution?> {
        val solution: Solution
        try {
            solution = service.deleteSolution(id)
        } catch(ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                else -> throw ex
            }
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    data class SolutionDTORequest(
        val user: String,
        val questId: String,
        val language: LanguageDTORequest,
        val difficulty: String,
        val solved: Boolean,
        val code: String,
        val testCode: String
    )

    data class LanguageDTORequest(
        val name: String,
        val fileExtension: String
    )
}
