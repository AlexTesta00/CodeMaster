import { CodeQuest } from "./codequest"; 
import { CodeQuestError } from "../error/codequest-error";
import { Language } from "../language/language";

export class CodeQuestFactory{
    static createCodeQuest(id: String, title: String, author: String, problem: String, timestamp: Date | null, languages: Language[]): CodeQuest {
        if(!author){
            throw new CodeQuestError.InvalidAuthor('Invalid nickname: this user doesn\'t exist');
        }

        if(!problem || problem==""){
            throw new CodeQuestError.InvalidProblem('Invalid problem: problem\'s body cannot be empty');
        }

        if(!title || title==""){
            throw new CodeQuestError.InvalidTitle('Invalid title: title\'s body cannot be empty');
        }
        
        return new CodeQuest(id, title, author, problem, timestamp, languages);
    }
}