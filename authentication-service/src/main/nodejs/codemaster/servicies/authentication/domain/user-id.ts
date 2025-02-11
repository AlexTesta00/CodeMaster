export class UserId {
    constructor(public readonly value: string) { if(!value) throw new Error("UserId cannot be empty");}
}