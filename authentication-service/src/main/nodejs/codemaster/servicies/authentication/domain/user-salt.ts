export class Salt{
    constructor(public readonly value: string) { if(!value) throw new Error("Salt cannot be empty");}
}