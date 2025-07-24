import { defineStore } from 'pinia'
import type {
    AllowedTypeName,
    FunctionParameter,
    Language,
} from './interface.ts'

export const codequestStore = defineStore('codequest', {
    state: () => ({
        title: '' as string,
        description: '' as string,
        difficulty: '' as string,
        constraints: '' as string,
        languages: [] as Language[],
        functionName: '' as string,
        parameters: [] as FunctionParameter[],
        returnType: '' as AllowedTypeName,
    }),
    actions: {
        setCodeQuestData(data: {
            title: string
            description: string
            difficulty: string
            constraints: string
            languages: Language[]
            functionName: string
            parameters: FunctionParameter[]
            returnType: AllowedTypeName
        }) {
            this.title = data.title
            this.description = data.description
            this.difficulty = data.difficulty
            this.constraints = data.constraints
            this.languages = data.languages
            this.functionName = data.functionName
            this.parameters = data.parameters
            this.returnType = data.returnType
        },
    },
})
