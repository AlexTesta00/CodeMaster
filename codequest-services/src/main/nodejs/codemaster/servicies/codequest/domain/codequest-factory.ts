import { CodeQuest } from "./codequest"; 

export class CodeQuestFactory{
    static createCodeQuest(id: String, title: String, author: String, problem: String, timestamp: Date): CodeQuest {
        if(!author){
            throw new Error('Invalid nickname: this user doesn\'t exist');
        }

        if(!problem || problem==""){
            throw new Error('Invalid problem: problem\'s body cannot be empty');
        }

        if(!title || title==""){
            throw new Error('Invalid title: title\'s body cannot be empty');
        }
        
        return new CodeQuest(id, title, author, problem, timestamp);
    }
}