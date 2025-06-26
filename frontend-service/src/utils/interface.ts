import type { Option } from 'fp-ts/Option'
import type { Link } from '../components/ContactsCard.vue'

export type Person = {
    name: string
    image: string
    role: string
    link: [Link]
}

export interface AuthenticationResponse {
    message: string
    success: boolean
    token?: string
    user?: {
        info: {
            nickname: {value: string}
            email: string
            password: string
            role: {name: 'admin' | 'user'}
        }
        banned: boolean
        refreshToken: string
    }
}

export interface UserId {
    value: string
}

export interface User {
    nickname: UserId
    bio: Option<string>
}

export interface ProfilePicture {
    url: string
    alt: Option<string>
}

export interface Language {
    name: string
    version: string
    fileExtension: string
}

export interface CV {
    url: string
}

export interface TrophyId {
    value: string
}

export interface Trophy {
    title: TrophyId
    description: string
    url: string
    xp: number
}

export interface LevelId {
    value: number
}

export interface Level {
    grade: LevelId
    title: string
    xpLevel: number
    imageUrl: string
}

export interface UserManager {
    userInfo: User
    profilePicture: Option<ProfilePicture>
    languages: Option<Iterable<Language>>
    cv: Option<CV>
    trophies: Option<Iterable<Trophy>>
    level: Level
}

export interface UserManagerResponse {
    message: string
    success: boolean
    user: UserManager
}

export interface GetAllUserResponse {
    message: string
    success: boolean
    user: UserManager[]
}

export interface Example {
    input: string
    output: string
    explanation: string
}

export interface Problem {
    description: string
    examples: Example[]
    constraints: string[]
}

export interface Difficulty {
    name: string
}

export interface CodeQuest {
    id: string
    title: string
    author: string
    problem: Problem
    timestamp: Date | null
    languages: Language[]
    difficulty: Difficulty
}

export interface CodeQuestResponse {
    message: string
    success: boolean
    codequest: CodeQuest
}

export interface CodeQuestsResponse {
    message: string
    success: boolean
    codequests: CodeQuest[]
}

export interface SolutionId {
    value: string
}

export interface Solution {
    id: SolutionId
    code: string
    questId: string
    user: string
    difficulty: Difficulty
    language: Language
    result: ExecutionResult
    solved: boolean
    testCode: string
}

export interface SolutionResponse {
    message: string
    success: boolean
    solution: Solution
}

export interface SolutionsResponse {
    message: string
    success: boolean
    solutions: Solution[]
}

export interface DebugResponse {
    message: string
    success: boolean
    user: ExecutionResult
}

export interface ExecutionResponse {
    message: string
    success: boolean
    user: CodeQuest
}

export type ExecutionResult =
    | { type: 'Pending' }
    | {
    type: 'Accepted'
    output: string[]
    exitCode: number
}
    | {
    type: 'TestsFailed'
    error: string
    output: string[]
    exitCode: number
}
    | {
    type: 'CompileFailed'
    error: string
    stderr: string
    exitCode: number
}
    | {
    type: 'RuntimeError'
    error: string
    stderr?: string
    exitCode: number
}
    | {
    type: 'TimeLimitExceeded'
    timeout: number
}
