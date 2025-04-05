import { Language } from "../language/language";
import { Problem } from "./problem";

export class CodeQuest{
    constructor(public readonly id: String, public title: String, public author: String, public problem: Problem, public timestamp: Date | null, public languages: Language[]){};
}