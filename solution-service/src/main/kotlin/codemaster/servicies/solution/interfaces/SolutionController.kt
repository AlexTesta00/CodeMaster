package codemaster.servicies.solution.interfaces

import codemaster.servicies.solution.domain.dto.SolutionsDTO.*
import codemaster.servicies.solution.application.SolutionService
import codemaster.servicies.solution.application.EmptyCodeException
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
        val codes: MutableList<Code> = mutableListOf()

        for (code in request.codes) {
            codes.add(
                Code(
                    Language(
                        code.language.name,
                        code.language.fileExtension
                    ),
                    code.code
                )
            )
        }

        try {
            solution = service.addSolution(
                SolutionId.generate(),
                request.user,
                request.questId,
                request.solved,
                codes,
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

    @PutMapping("/code/{id}", produces = ["application/json"])
    suspend fun changeSolutionCode(
        @PathVariable id: SolutionId,
        @RequestBody newCode: CodeDTORequest,
    ): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.modifySolutionCode(
                id,
                newCode.code,
                Language(newCode.language.name, newCode.language.fileExtension)
            )
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
        @RequestBody request: ExecuteDTORequest
    ): ResponseEntity<Solution?> {
        val solution : Solution
        try {
            solution = service.executeSolution(
                id,
                Language(request.language.name, request.language.fileExtension),
                request.code,
                request.testCode
            )
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
        @PathVariable id : SolutionId,
        @RequestBody request: ExecuteDTORequest
    ): ResponseEntity<ExecutionResult> {
        val logger = LoggerFactory.getLogger(this::class.java)
        return try {
            val result = service.compileSolution(
                id,
                Language(request.language.name, request.language.fileExtension),
                request.code,
                request.testCode
            )
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
}
