import { Language } from "../language/language";

export class CodeQuest{
    constructor(public readonly id: String, public title: String, public author: String, public problem: String, public timestamp: Date, public languages: Language[]){};
}