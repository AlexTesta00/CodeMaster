export class CodequestGenerateEvent {
    constructor(public readonly questId: string,
                public readonly language: string[],
                public readonly functionName: string,
                public readonly parameters: {
                          name: string,
                          typeName: string
                      }[],
                public readonly returnType: string,
                public readonly examples: {
                          inputs: string[]
                          output: string
                      }[]) {}
}