package codemaster.servicies.solution.application

import codemaster.servicies.solution.application.errors.EmptyCodeException
import codemaster.servicies.solution.application.errors.EmptyLanguageException
import codemaster.servicies.solution.application.errors.EmptyTestCodeException
import codemaster.servicies.solution.application.utility.LanguageCommandProvider
import codemaster.servicies.solution.application.utility.UtilityFunctions.parseJUnitConsoleOutput
import codemaster.servicies.solution.application.utility.UtilityFunctions.prepareCodeDir
import codemaster.servicies.solution.application.utility.UtilityFunctions.runDockerCommand
import codemaster.servicies.solution.domain.model.*
import codemaster.servicies.solution.domain.repository.SolutionRepository
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class SolutionService(
    private val repository: SolutionRepository,
    @Value("\${solution.runner.path:build/tmp/code-run}") private val injectedRunnerPath: String
) {

    companion object {
        const val TIMEOUT: Long = 20_000
    }

    suspend fun addSolution(
        id: SolutionId,
        user: String,
        questId: String,
        language: Language,
        difficulty: Difficulty,
        solved: Boolean,
        code: String,
        testCode: String
    ): Solution {
        val newSolution = SolutionFactoryImpl().create(id, user, questId, language, difficulty, solved, code, testCode)
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

    suspend fun getSolutionsByUserAndDifficulty(user: String, difficulty: Difficulty): List<Solution> {
        val solution = repository
            .findSolutionsByUserAndDifficulty(user, difficulty)
            .collectList()
            .awaitSingleOrNull()
        return solution ?: throw NoSuchElementException(
            "No solved solution found in DB created by $user or with difficulty \"${difficulty.name}\""
        )
    }

    suspend fun getSolutionsByUser(user: String): List<Solution> {
        val solution = repository.findSolutionsByUser(user).collectList().awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB submitted by \"$user\"")
    }

    suspend fun getSolutionsByLanguage(language: Language, questId: String): List<Solution> {
        if (language.name.isBlank() || language.fileExtension.isBlank()) {
            throw EmptyLanguageException()
        }
        val solution = repository.findSolutionsByLanguage(language, questId).collectList().awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB")
    }

    suspend fun modifySolutionCode(id: SolutionId, code: String): Solution {
        if (code.isBlank()) {
            throw EmptyCodeException()
        }
        val solution = repository.updateCode(id, code).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB for id = $id")
    }

    suspend fun modifySolutionLanguage(id: SolutionId, language: Language): Solution {
        if (language.name.isBlank() || language.fileExtension.isBlank()) {
            throw EmptyLanguageException()
        }
        val solution = repository.updateLanguage(id, language).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB for id = $id")
    }

    suspend fun modifySolutionTestCode(id: SolutionId, testCode: String): Solution {
        if (testCode.isBlank()) {
            throw EmptyTestCodeException()
        }
        val solution = repository.updateTestCode(id, testCode).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB for id = $id")
    }

    suspend fun modifySolutionDifficulty(id: SolutionId, difficulty: Difficulty): Solution {
        val solution = repository.updateDifficulty(id, difficulty).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB for id = $id")
    }

    suspend fun deleteSolution(id: SolutionId): Solution {
        val solution = repository.removeSolutionById(id).awaitSingleOrNull()
        return solution ?: throw NoSuchElementException("No solution found in DB for id = $id")
    }

    suspend fun compileSolution(id: SolutionId, newCode: String): ExecutionResult {
        val solution = repository.updateCode(id, newCode).awaitSingleOrNull()
            ?: throw NoSuchElementException("No solution found in DB for id = $id")

        val codeDir = prepareCodeDir(solution, injectedRunnerPath)
        val commands = LanguageCommandProvider.getCommandsFor(solution.language)

        return runDockerCommand(
            id,
            codeDir,
            commands.compileCommand,
            "compile"
        ) { exitCode, output ->
            if (exitCode == 0) ExecutionResult.Accepted(emptyList(), exitCode)
            else ExecutionResult.CompileFailed("Compilation failed", output, exitCode)
        }
    }

    suspend fun executeSolution(id: SolutionId, newCode: String): Solution {
        val solution = repository.updateCode(id, newCode).awaitSingleOrNull()
            ?: throw NoSuchElementException("No solution found in DB for id = $id")

        val codeDir = prepareCodeDir(solution, injectedRunnerPath)
        val commands = LanguageCommandProvider.getCommandsFor(solution.language)

        val compileResult = runDockerCommand(
            id,
            codeDir,
            commands.compileCommand,
            "compile"
        ) { exitCode, output ->
            if (exitCode == 0) ExecutionResult.Accepted(emptyList(), exitCode)
            else ExecutionResult.CompileFailed("Compilation failed", output, exitCode)
        }

        if (compileResult !is ExecutionResult.Accepted) {
            return repository.updateResult(id, compileResult).awaitSingle()
        }

        val runResult = runDockerCommand(
            id,
            codeDir,
            commands.runCommand,
            "test"
        ) { exitCode, output ->
            val parsedOutput = parseJUnitConsoleOutput(output)
            if (exitCode == 0) ExecutionResult.Accepted(parsedOutput, exitCode)
            else ExecutionResult.TestsFailed("Tests failed", parsedOutput, exitCode)
        }

        val wasSuccessful = runResult is ExecutionResult.Accepted &&
                runResult.output.all { "[OK]" in it }

        repository.updateSolved(id, wasSuccessful).awaitSingle()
        val updatedSolution = repository.updateResult(id, runResult).awaitSingle()

        return updatedSolution
    }
}
