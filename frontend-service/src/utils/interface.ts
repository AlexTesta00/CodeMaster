import type { Option } from 'fp-ts/Option'
import type { Link } from '../components/ContactsCard.vue'

export type Person = {
    name: string
    image: string
    role: string
    link: [Link]
}

export type SimpleTypeName = 'int' | 'string' | 'boolean' | 'double' | 'long' | 'float'

type Primitive = SimpleTypeName

type ListTypes = `List<${Primitive}>`

type MapTypes =
    | `Map<int,int>` | `Map<int,string>` | `Map<int,boolean>` | `Map<int,double>` | `Map<int,long>` | `Map<int,float>`
    | `Map<string,int>` | `Map<string,string>` | `Map<string,boolean>` | `Map<string,double>` | `Map<string,long>` | `Map<string,float>`
    | `Map<boolean,int>` | `Map<boolean,string>` | `Map<boolean,boolean>` | `Map<boolean,double>` | `Map<boolean,long>` | `Map<boolean,float>`
    | `Map<double,int>` | `Map<double,string>` | `Map<double,boolean>` | `Map<double,double>` | `Map<double,long>` | `Map<double,float>`
    | `Map<long,int>` | `Map<long,string>` | `Map<long,boolean>` | `Map<long,double>` | `Map<long,long>` | `Map<long,float>`
    | `Map<float,int>` | `Map<float,string>` | `Map<float,boolean>` | `Map<float,double>` | `Map<float,long>` | `Map<float,float>`

export type ComplexTypeName = ListTypes | MapTypes

export type AllowedTypeName = SimpleTypeName | ComplexTypeName


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

export interface Solution {
    id: string
    questId: string
    user: string
    codes: LanguageCodes[]
    solved: boolean
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

export interface ExampleFieldErrors {
    inputs: (string | null)[]
    output: string | null
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

export interface FunctionParameter {
    name: string
    typeName: AllowedTypeName
}

export interface FunctionExample {
    inputs: string[]
    output: string
}

export interface GeneratorCodeRequest {
    questId: string
    functionName: string
    parameters: FunctionParameter[]
    returnType: AllowedTypeName
    examples: FunctionExample[]
    languages: string[]
}

export interface CodeGeneratorResponse {
    message: string
    success: boolean
    generatedCodes: GeneratedCode
}

export interface GeneratedCode {
    questId: string
    entries: Codes[]
}

export interface LanguageCodes {
    language: {
        name: string
        fileExtension: string
    }
    code: string
}

export interface Codes {
    language: string
    templateCode: string
    testCode: string
}

export interface ResultResponse {
    message: string,
    success: boolean,
    result: ExecutionResult
}