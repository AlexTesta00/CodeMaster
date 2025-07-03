import axios from 'axios'
import type {
    AllowedTypeName,
    AuthenticationResponse, CodeGeneratorResponse,
    CodeQuest,
    CodeQuestResponse,
    CodeQuestsResponse,
    Difficulty,
    Example, GetAllUserResponse,
    FunctionExample, FunctionParameter, GeneratorCodeRequest,
    Language,
    Problem, Solution, SolutionResponse,
    SolutionsResponse, UserManager,
    UserManagerResponse, LanguageCodes, ResultResponse, CommentsResponse,
    Comment
} from './interface.ts'

const AUTHENTICATION_URL = 'http://localhost/api/v1/authentication/'
const USER_URL = 'http://localhost/api/v1/users/'
const CODEQUEST_URL = 'http://localhost/api/v1/codequests/'
const SOLUTION_URL = 'http://localhost/api/v1/solutions/'
const GENERATOR_URL = 'http://localhost/api/v1/code-generator/'
const COMMUNITY_URL = 'http://localhost/api/v1/comments/'

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
    user: string,
    questId: string,
    codes: LanguageCodes[],
    solved: boolean
): Promise<SolutionResponse> => {
    console.log({
        user,
        questId,
        solved,
        codes
    });

    const code = codes.map((entry) => {
        return {
            language: {
                name: entry.language.name,
                fileExtension: entry.language.fileExtension
            },
            code: entry.code
        }
    })

    const response = await axios.post(`${SOLUTION_URL}`, {
        user: user,
        questId: questId,
        solved: solved,
        codes: code
    })

    const solution = {
        id: response.data.id,
        codes: response.data.codes,
        questId: response.data.questId,
        user: response.data.user,
        solved: response.data.solved,
    }

    return {
        message: response.statusText,
        success: response.status == 200,
        solution
    }
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

export const deleteCodequestById = async (
    questId: string
): Promise<CodeQuestResponse> => {
    const response = await axios.delete(`${CODEQUEST_URL}${questId}`)

    return {
        message: response.data.message,
        success: response.data.success,
        codequest: response.data.codequest
    }
}

export const getAllSolvedSolutions = async (
    nickname: string
): Promise<SolutionsResponse> => {
    const response = await axios.get(`${SOLUTION_URL}solved/${nickname}`)

    const solutions: Solution[] = response.data.map((sol: any) => {
        return {
            id: sol.id,
            codes: sol.codes,
            questId: sol.questId,
            user: sol.user,
            solved: sol.solved,
        }
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

    const solutions: Solution[] = response.data.map((sol: any) => {
        return {
            id: sol.id,
            codes: sol.codes,
            questId: sol.questId,
            user: sol.user,
            solved: sol.solved,
        }
    })

    return {
        message: response.statusText,
        success: response.status === 200,
        solutions
    }
}

export const updateSolution = async (
    id: string,
    code: LanguageCodes
): Promise<SolutionResponse> => {

    const payload = {
        code: code.code,
        language: {
            name: code.language.name,
            fileExtension: code.language.fileExtension
        }
    }
    const response = await axios.put(`${SOLUTION_URL}code/${id}`, payload)

    return {
        message: response.statusText,
        success: response.status === 200,
        solution: response.data
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

export const getGeneratedCodes = async (
    questId: string
): Promise<CodeGeneratorResponse> => {
    const response = await axios.get(`${GENERATOR_URL}${questId}`)

    return {
        generatedCodes: response.data,
        message: response.statusText,
        success: response.status == 200
    }
}

export const debugCode = async (
    id: string,
    testCode: string,
    languageCode: LanguageCodes
): Promise<ResultResponse> => {

    const payload = {
        language: {
            name: languageCode.language.name,
            fileExtension: languageCode.language.fileExtension
        },
        code: languageCode.code,
        testCode: testCode
    }

    const response = await axios.put(`${SOLUTION_URL}compile/${id}`, payload)

    return {
        message: response.statusText,
        success: response.status == 200,
        result: response.data
    }
}

export const executeCode = async (
    id: string,
    testCode: string,
    languageCode: LanguageCodes
): Promise<ResultResponse> => {

    const payload = {
        language: {
            name: languageCode.language.name,
            fileExtension: languageCode.language.fileExtension
        },
        code: languageCode.code,
        testCode: testCode
    }

    const response = await axios.put(`${SOLUTION_URL}execute/${id}`, payload)

    return {
        message: response.statusText,
        success: response.status == 200,
        result: response.data.result
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

export const addComment = async (
    questId: string,
    author: string,
    content: string
): Promise<{ message: string; success: boolean; result: Comment }> => {
    const response = await axios.post(`${COMMUNITY_URL}`, {
        questId: questId,
        author: author,
        content: content
    })

    return response.data
}

export const getCommentsByQuest = async (
    questId: string
): Promise<CommentsResponse> => {
    const response = await axios.get(`${COMMUNITY_URL}/codequests/${questId}`)

    return response.data
}