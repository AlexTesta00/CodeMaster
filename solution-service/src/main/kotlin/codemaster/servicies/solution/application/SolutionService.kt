package codemaster.servicies.solution.application

import codemaster.servicies.solution.application.errors.EmptyCodeException
import codemaster.servicies.solution.application.errors.EmptyLanguageException
import codemaster.servicies.solution.application.utility.LanguageCommandProvider
import codemaster.servicies.solution.application.utility.UtilityFunctions.parseJUnitConsoleOutput
import codemaster.servicies.solution.application.utility.UtilityFunctions.prepareCodeDir
import codemaster.servicies.solution.application.utility.UtilityFunctions.runDocker
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.infrastructure.SolutionRepository
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.springframework.stereotype.Service

@Service
class SolutionService(
    private val repository: SolutionRepository
) {

    companion object {
        const val CONTAINER_TIMEOUT: Long = 30
        const val PROCESS_TIMEOUT: Long = 20_000
        const val TIME_SPAN: Long = 60_000
    }

    suspend fun addSolution(
        id: SolutionId,
        user: String,
        questId: String,
        solved: Boolean,
        codes: List<Code>
    ): Solution {
        val newSolution = SolutionFactoryImpl().create(id, user, questId, solved, codes)
        val solution = repository.addNewSolution(newSolution).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("Error while inserting new solution")
    }

    suspend fun getSolution(id: SolutionId): Solution {
        val solution = repository.findSolutionById(id).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB with id = \"$id\"")
    }

    suspend fun getSolutionsByQuestId(questId: String): List<Solution> {
        val solution = repository.findSolutionsByQuestId(questId).collectList().awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB with questId = \"$questId\"")
    }

    suspend fun getSolvedSolutionsByUser(user: String): List<Solution> {
        val solution = repository.findSolvedSolutionsByUser(user).collectList().awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB created by \"$user\"")
    }

    suspend fun getSolutionsByUser(user: String): List<Solution> {
        val solution = repository.findSolutionsByUser(user).collectList().awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB submitted by \"$user\"")
    }

    suspend fun modifySolutionCode(id: SolutionId, code: String, language: Language): Solution {
        if (code.isBlank()) {
            throw EmptyCodeException()
        }
        val solution = repository.updateCode(id, code, language).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB for id = $id")
    }

    suspend fun deleteSolution(id: SolutionId): Solution {
        val solution = repository.removeSolutionById(id).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB for id = $id")
    }

    suspend fun deleteSolutionsByUser(user: String): List<Solution> {
        val solutions = repository.removeSolutionsByUser(user).collectList().awaitSingleOrNull()
        return solutions ?: throw NoSuchElementException("No solution created by user '$user' founded")
    }

    suspend fun deleteSolutionsByCodequest(questId: String): List<Solution> {
        val solutions = repository.removeSolutionsByCodequest(questId).collectList().awaitSingleOrNull()
        return solutions ?: throw NoSuchElementException("No solution created by user '$questId' founded")
    }

    suspend fun compileSolution(id: SolutionId, language: Language, newCode: String, testCode: String): ExecutionResult {
        val solution = repository.updateCode(id, newCode, language).awaitSingleOrNull()
            ?: throw NoSuchElementException("No solution found in DB for id = $id")

        val commands = LanguageCommandProvider.getCommandsFor(language)
        val codeDir = prepareCodeDir(language, newCode, testCode)

        return runDocker(
            id,
            codeDir,
            commands.compileCommand,
            "compile"
        ) { exitCode, output, errors ->
            if (exitCode == 0) ExecutionResult.Accepted(parseJUnitConsoleOutput(output), exitCode)
            else ExecutionResult.CompileFailed("Compilation failed", errors, exitCode)
        }
    }

    suspend fun executeSolution(id: SolutionId, language: Language, newCode: String, testCode: String): Solution {
        val solution = repository.updateCode(id, newCode, language).awaitSingleOrNull()
            ?: throw NoSuchElementException("No solution found in DB for id = $id")

        val commands = LanguageCommandProvider.getCommandsFor(language)
        val codeDir = prepareCodeDir(language, newCode, testCode)

        val compileResult = runDocker(
            id,
            codeDir,
            commands.compileCommand,
            "compile"
        ) { exitCode, output, errors ->
            if (exitCode == 0) ExecutionResult.Accepted(parseJUnitConsoleOutput(output), exitCode)
            else ExecutionResult.CompileFailed("Compilation failed", errors, exitCode)
        }

        if (compileResult !is ExecutionResult.Accepted) {
            return repository.updateResult(id, compileResult).awaitSingle()
        }

        val runResult = runDocker(
            id,
            codeDir,
            commands.compileAndRunCommand,
            "run"
        ) { exitCode, output, errors ->
            val parsedOutput = parseJUnitConsoleOutput(output)
            if (exitCode == 0) ExecutionResult.Accepted(parsedOutput.ifEmpty { errors.lines() }, exitCode)
            else ExecutionResult.TestsFailed("Tests failed", parsedOutput, exitCode)
        }

        val wasSuccessful = runResult is ExecutionResult.Accepted &&
                runResult.output.all { "[OK]" in it }

        repository.updateSolved(id, wasSuccessful).awaitSingle()
        val updatedSolution = repository.updateResult(id, runResult).awaitSingle()

        return updatedSolution
    }

    suspend fun pingMongo(): Boolean {
        return try {
            repository.existBy().awaitFirst()
            true
        } catch (e: Exception) {
            false
        }
    }
}
