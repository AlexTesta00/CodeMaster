package codemaster.servicies.solution.interfaces

import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.application.errors.EmptyCodeException
import codemaster.servicies.solution.application.errors.EmptyLanguageException
import codemaster.servicies.solution.domain.errors.DomainException
import codemaster.servicies.solution.domain.model.ExecutionResult
import codemaster.servicies.solution.domain.model.Language
import codemaster.servicies.solution.domain.model.Solution
import codemaster.servicies.solution.domain.model.SolutionId
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/solutions")
class SolutionController(private val service: SolutionService) {

    @PostMapping("/", produces = ["application/json"])
    suspend fun addSolution(@RequestBody request: SolutionDTORequest): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.addSolution(
                SolutionId.generate(),
                request.user,
                request.questId,
                request.language,
                request.code,
                request.testCode
            )
        } catch(ex: DomainException) {
            return ResponseEntity.badRequest().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @GetMapping("/id={id}", produces = ["application/json"])
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

    @GetMapping("/questId={questId}", produces = ["application/json"])
    suspend fun getSolutionsByCodeQuest(@PathVariable questId: String): ResponseEntity<List<Solution>?> {
        val solutions : List<Solution>

        try {
            solutions = service.getSolutionsByQuestId(questId)
        } catch(ex: NoSuchElementException) {
            return ResponseEntity.internalServerError().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solutions)
    }

    @GetMapping("/language/", produces = ["application/json"])
    suspend fun getSolutionsByLanguage(
        @RequestParam name : String?,
        @RequestParam extension : String?
    ): ResponseEntity<List<Solution>?> {
        val solutions : List<Solution>

        if (name == null || extension == null) {
            return ResponseEntity.badRequest().build()
        }

        val language = Language(name, extension)
        try {
            solutions = service.getSolutionsByLanguage(language)
        } catch (ex: EmptyLanguageException) {
            return ResponseEntity.badRequest().build()
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solutions)
    }

    @PutMapping("/language/id={id}", produces = ["application/json"])
    suspend fun changeSolutionLanguage(
        @PathVariable id : SolutionId,
        @RequestBody newLanguage: LanguageDTORequest
    ): ResponseEntity<Solution?> {
        val language = newLanguage.language
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

    @PutMapping("/code/id={id}", produces = ["application/json"])
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

    @PutMapping("/test-code/id={id}", produces = ["application/json"])
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

    @PutMapping("/execute/id={id}", produces = ["application/json"])
    suspend fun executeSolutionCode(
        @PathVariable id : SolutionId,
        @RequestBody newCode: String
    ): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            service.modifySolutionCode(id, newCode)
            solution = service.executeSolution(id)
        } catch (ex: Exception) {
            return when(ex) {
                is NoSuchElementException -> ResponseEntity.notFound().build()
                is EmptyCodeException -> ResponseEntity.badRequest().build()
                else -> ResponseEntity.internalServerError().build()
            }
        }
        if (solution.result is ExecutionResult.TimeLimitExceeded) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body(solution)
        }
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(solution)
    }

    @DeleteMapping("/id={id}", produces = ["application/json"])
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
        val language: Language,
        val code: String,
        val testCode: String
    )

    data class LanguageDTORequest(
        val language: Language
    )
}
