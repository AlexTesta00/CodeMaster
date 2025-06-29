import axios from 'axios'
import type {
    AllowedTypeName,
    AuthenticationResponse, CodeGeneratorResponse,
    CodeQuest,
    CodeQuestResponse,
    CodeQuestsResponse,
    Difficulty,
    Example, ExecutionResult, GetAllUserResponse,
    FunctionExample, FunctionParameter, GeneratorCodeRequest,
    Language,
    Problem, Solution, SolutionResponse,
    SolutionsResponse, UserManager,
    UserManagerResponse,
} from './interface.ts'

const AUTHENTICATION_URL = 'http://localhost/api/v1/authentication/'
const USER_URL = 'http://localhost/api/v1/users/'
const CODEQUEST_URL = 'http://localhost/api/v1/codequests/'
const SOLUTION_URL = 'http://localhost/api/v1/solutions/'
const GENERATOR_URL = 'http://localhost/api/v1/code-generator/'

axios.defaults.withCredentials = true

export const registerNewUser = async (
    nickname: string,
    email: string,
    password: string,
    role: string = 'user'
): Promise<AuthenticationResponse> => {
    const response = await axios.post(`${AUTHENTICATION_URL}register`, {
        nickname,
        email,
        password,
        role,
    })
    return response.data
}

export const loginUser = async (
    nickname: string,
    password: string
): Promise<AuthenticationResponse> => {
    const response = await axios.post(`${AUTHENTICATION_URL}login`, {
        nickname,
        password,
    })
    return response.data
}

export const logoutUser = async (nickname: string): Promise<void> => {
    await axios.post(`${AUTHENTICATION_URL}logout`, { nickname })
}

export const getUserByNickname = async (
    nickname: string
): Promise<UserManagerResponse> => {
    const response = await axios.get(`${USER_URL}${nickname}`)
    return response.data
}

export const updateProfilePicture = async (
    nickname: string,
    newProfilePicture: { url: string; alt: string }
): Promise<UserManagerResponse> => {
    const response = await axios.put(`${USER_URL}profile-picture`, {
        nickname,
        newProfilePicture,
    })
    return response.data
}

export const updateCV = async (
    nickname: string,
    newCV: { url: string }
): Promise<UserManagerResponse> => {
    const response = await axios.put(`${USER_URL}cv`, {
        nickname,
        newCV,
    })
    return response.data
}

export const updateBio = async (
    nickname: string,
    newBio: string
): Promise<UserManagerResponse> => {
    const response = await axios.put(`${USER_URL}bio`, {
        nickname,
        newBio,
    })
    return response.data
}

export const updateLanguages = async (
    nickname: string,
    newLanguages: { name: string }[]
): Promise<UserManagerResponse> => {
    const response = await axios.put(`${USER_URL}languages`, {
        nickname,
        newLanguages,
    })
    return response.data
}

export const addNewCodequest = async (
    title: string,
    author: string | null,
    problem: Problem,
    languages: Language[],
    difficulty: Difficulty
): Promise<CodeQuestResponse> => {
    const response = await axios.post(`${CODEQUEST_URL}`, {
        title,
        author,
        problem,
        languages,
        difficulty
    })
    return response.data
}

export const addNewSolution = async (
    user: String,
    questId: String,
    language: Language,
    difficulty: Difficulty,
    solved: Boolean,
    code: String,
    testCode: String
): Promise<SolutionResponse> => {
    console.log({
        user,
        questId,
        language,
        difficulty,
        solved,
        code,
        testCode
    });
    const response = await axios.post(`${SOLUTION_URL}`, {
        user: user,
        questId: questId,
        language: {
            name: language.name,
            fileExtension: language.fileExtension
        },
        difficulty: difficulty.name,
        solved: solved,
        code: code,
        testCode: testCode
    })
    return response.data
}

export const getAllCodequests = async (): Promise<CodeQuestsResponse> => {
    const response = await axios.get(`${CODEQUEST_URL}`)
    const codequests: CodeQuest[] = response.data.codequests.map((codequest: any) => ({
        id: codequest.id,
        title: codequest.title,
        author: codequest.author,
        problem: {
            description: codequest.problem.description,
            examples: codequest.problem.examples.map((ex: any): Example => ({
                input: ex.input,
                output: ex.output,
                explanation: ex.explanation
            })),
            constraints: codequest.problem.constraints
        },
        timestamp: codequest.timestamp ?? null,
        languages: codequest.languages as Language[],
        difficulty: codequest.difficulty as Difficulty
    }))

    return {
        message: response.data.message,
        success: response.data.success,
        codequests
    }
}

export const getCodequestById = async (
    questId: string
): Promise<CodeQuestResponse> => {
    const response = await axios.get(`${CODEQUEST_URL}${questId}`)
    const cq = response.data.codequest

    const codequest: CodeQuest = {
        id: cq.id,
        title: cq.title,
        author: cq.author,
        problem: {
            description: cq.problem.description,
            examples: cq.problem.examples.map((ex: any): Example => ({
                input: ex.input,
                output: ex.output,
                explanation: ex.explanation
            })),
            constraints: cq.problem.constraints
        },
        timestamp: cq.timestamp ?? null,
        languages: cq.languages as Language[],
        difficulty: cq.difficulty as Difficulty
    }

    return {
        message: response.data.message,
        success: response.data.success,
        codequest
    }
}

export const getAllSolvedSolutions = async (
    nickname: string
): Promise<SolutionsResponse> => {
    const response = await axios.get(`${SOLUTION_URL}solved/${nickname}`)

    const solutions: Solution[] = response.data.map((sol: any): Solution => {
        return convertSolution(sol)
    })

    return {
        message: response.statusText,
        success: response.status === 200,
        solutions
    }
}

export const getSolutionsByCodequest = async (
    questId: string
): Promise<SolutionsResponse> => {
    const response = await axios.get(`${SOLUTION_URL}codequests/${questId}`)

    const solutions: Solution[] = response.data.map((sol: any): Solution => {
        return convertSolution(sol)
    })

    return {
        message: response.statusText,
        success: response.status === 200,
        solutions
    }
}

export const generateCodequestCodes = async (
    questId: string,
    functionName: string,
    parameters: FunctionParameter[],
    returnType: AllowedTypeName,
    examples: FunctionExample[],
    languages: string[]
): Promise<CodeGeneratorResponse> => {
    const payload: GeneratorCodeRequest = {
        questId,
        functionName,
        parameters,
        returnType,
        examples,
        languages
    }

    const response = await axios.post(`${GENERATOR_URL}generate`, payload)
    return {
        generatedCodes: response.data,
        message: response.statusText,
        success: response.status == 200,
    }
}

const convertSolution = (sol: any): Solution => {

    const baseResult = sol.result
    let result: ExecutionResult

    switch (baseResult.type) {
        case 'pending':
            result = { type: 'Pending' }
            break
        case 'accepted':
            result = {
                type: 'Accepted',
                output: baseResult.output,
                exitCode: baseResult.exitCode
            }
            break
        case 'testsFailed':
            result = {
                type: 'TestsFailed',
                error: baseResult.error,
                output: baseResult.output,
                exitCode: baseResult.exitCode
            }
            break
        case 'compileFailed':
            result = {
                type: 'CompileFailed',
                error: baseResult.error,
                stderr: baseResult.stderr,
                exitCode: baseResult.exitCode
            }
            break
        case 'runtimeError':
            result = {
                type: 'RuntimeError',
                error: baseResult.error,
                stderr: baseResult.stderr,
                exitCode: baseResult.exitCode
            }
            break
        case 'timeLimitExceeded':
            result = {
                type: 'TimeLimitExceeded',
                timeout: baseResult.timeout
            }
            break
        default:
            throw new Error(`Unknown ExecutionResult type: ${baseResult.type}`)
    }

    return {
        id: { value: sol.id.value },
        code: sol.code,
        questId: sol.questId,
        user: sol.user,
        difficulty: { name: sol.difficulty.name },
        language: {
            name: sol.language.name,
            version: sol.language.version,
            fileExtension: sol.language.fileExtension
        },
        result,
        solved: sol.solved,
        testCode: sol.testCode
    }
}

export const getAllUsers = async (): Promise<GetAllUserResponse> => {
    const response = await axios.get(`${USER_URL}`)
    return {
        message: response.data.message,
        success: response.data.success,
        user: response.data.user as UserManager[]
    }
}

export const banUser = async (
  nicknameFrom: string,
  nicknameTo: string
): Promise<{ message: string; success: boolean }> => {
    const response = await axios.patch(`${AUTHENTICATION_URL}ban`, {
        nicknameFrom,
        nicknameTo
    })
    return response.data
}

export const unbanUser = async (
  nicknameFrom: string,
  nicknameTo: string
): Promise<{ message: string; success: boolean }> => {
    const response = await axios.patch(`${AUTHENTICATION_URL}unban`, {
        nicknameFrom,
        nicknameTo
    })
    return response.data
}