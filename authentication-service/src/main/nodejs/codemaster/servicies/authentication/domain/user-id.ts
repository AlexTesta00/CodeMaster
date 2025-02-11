export class UserId {
    private readonly value: string;

    constructor(value: string) {
        if(!value) throw new Error("UserId cannot be empty");
        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}