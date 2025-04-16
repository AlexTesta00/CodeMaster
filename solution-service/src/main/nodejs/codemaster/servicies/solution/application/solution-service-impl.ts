import { SolutionService, SolutionServiceError } from './solution-service'
import { Language } from '../domain/language'
import { Solution } from '../domain/solution'
import mongoose from 'mongoose'
import { SolutionRepositoryImpl } from '../infrastructure/solution-repository-impl'
import { SolutionFactory } from '../domain/solution-factory'
import * as path from 'node:path'
import { cg, createUser, execShellCommand } from '../utils/utils'
import { v4 as uuidv4 } from 'uuid'

export class SolutionServiceImpl implements SolutionService {
  private repository = new SolutionRepositoryImpl()

  async addSolution(code: string, codequest: mongoose.Types.ObjectId, author: string, language: Language, fileEncoding: string, result: any): Promise<Solution> {
    const newSolution = SolutionFactory.newSolution(
      new mongoose.Types.ObjectId(),
      code,
      codequest,
      author,
      language,
      fileEncoding,
      result
    )
    return await this.repository.addNewSolution(newSolution)
  }

  async executeCode(id: mongoose.Types.ObjectId): Promise<any> {
    const solution = await this.repository.findSolutionById(id)

    const execId = `exec_${uuidv4()}` // Unique user ID using UUID, we must not use Date to generate an id because users created in the same time ( in parallel ) may have the same id
    await cg(execId)
    let pgid // Process group ID to track

    // Step 1: Create a new user
    await createUser(execId)
    const userHomeDir = `/home/${execId}`
    const tempDir = path.join(userHomeDir, "temp", execId)

    // Create the temporary directory for this execution
    await execShellCommand(`sudo -u ${execId} mkdir -p ${tempDir}`)
    const cgroupTasksFile = `/sys/fs/cgroup/pids/engine_${execId}/cgroup.procs`
    // Prepare the shell script content
    let scriptContent = `
    #!/bin/sh
    echo $$ >> ${cgroupTasksFile}
    ulimit -t 10`
    // Add language-specific execution logic
    switch (solution.language.name) {
      case "Java": {
        const className = "Main";
        const javaFilePath = path.join(tempDir, `${className}.java`);

        // Java commands: Write code, compile, and run
        await execShellCommand(
          `echo '${solution.code}' | sudo -u ${execId} tee ${javaFilePath}`
        );

        scriptContent += `
          javac ${javaFilePath}
          java -cp ${tempDir} ${className}
        `;
        break;
      }

      case "Javascript": {
        const jsFilePath = path.join(tempDir, "script.js");

        // JavaScript commands: Write code and run
        await execShellCommand(
          `echo '${solution.code}' | sudo -u ${execId} tee ${jsFilePath}`
        );
        scriptContent += `
          node ${jsFilePath}
        `;
        break;
      }

      case "Scala": {
        const className = "Main";
        const javaFilePath = path.join(tempDir, `${className}.scala`);

        // Java commands: Write code, compile, and run
        await execShellCommand(
          `echo '${solution.code}' | sudo -u ${execId} tee ${javaFilePath}`
        );

        scriptContent += `
          scalac ${javaFilePath}
          scala -cp ${tempDir} ${className}
        `;
        break;
      }
    }
  }

  async getSolutionById(id: mongoose.Types.ObjectId): Promise<Solution> {
    try {
      return await this.repository.findSolutionById(id)
    } catch {
      throw new SolutionServiceError.SolutionNotFound('Solution with id "' + id.toString() + '" does not exist in database')
    }
  }

  async modifySolutionCode(id: mongoose.Types.ObjectId, code: string): Promise<void> {
    try {
      await this.repository.updateCode(id, code)
    } catch {
      throw new SolutionServiceError.SolutionNotFound('Solution with id "' + id.toString() + '" does not exist in database')
    }
  }

  async modifySolutionLanguage(id: mongoose.Types.ObjectId, language: Language): Promise<void> {
    try {
      await this.repository.updateLanguage(id, language)
    } catch {
      throw new SolutionServiceError.SolutionNotFound('Solution with id "' + id.toString() + '" does not exist in database')
    }
  }

}