import mongoose from "mongoose";
import { CodeQuest } from "../domain/codequest/codequest";
import { CodeQuestFactory } from "../domain/codequest/codequest-factory";
import { Problem } from "../domain/codequest/problem";
import { Language } from "../domain/language/language";
import { CodeQuestRepository } from "../infrastructure/codequest/codequest-repository";
import { CodeQuestRepositoryImpl } from "../infrastructure/codequest/codequest-repository-impl";
import { LanguageRepository } from "../infrastructure/language/language-repository";
import { LanguageRepositoryImpl } from "../infrastructure/language/language-repository-impl";
import { CodeQuestService, CodeQuestServiceError } from "./codequest-service";
import {LanguageFactory} from "../domain/language/language-factory";

export class CodeQuestServiceImpl implements CodeQuestService{
    private languageRepo: LanguageRepository = new LanguageRepositoryImpl()
    private codequestRepo: CodeQuestRepository = new CodeQuestRepositoryImpl()

    async addCodeQuest(title: String, author: String, problem: Problem, timestamp: Date | null, languages: Language[]): Promise<CodeQuest> {
        if(languages!=null) {
            for (const lang of languages) {
                await this.#languageAvailable(lang)
            }
        }
        const newCodequest = CodeQuestFactory.newCodeQuest(new mongoose.Types.ObjectId().toString(), title, author, problem, timestamp, languages);
        return await this.codequestRepo.save(newCodequest)
    }
    async getCodeQuests(): Promise<CodeQuest[]> {
        try {
            return await this.codequestRepo.getAllCodeQuests();
        } catch(error) {
            throw new CodeQuestServiceError.CodeQuestNotFound('No codequests found in database')
        }
    }
    async getCodeQuestById(questId: String): Promise<CodeQuest> {
        try {
            return await this.codequestRepo.findCodeQuestById(questId)
        } catch(error) {
            throw new CodeQuestServiceError.InvalidCodeQuestId('No codequest found with id: ' + questId)
        }
    }
    async getCodeQuestsByAuthor(author: String): Promise<CodeQuest[]> {
        try {
            return await this.codequestRepo.findCodeQuestsByAuthor(author)
        } catch(error) {
            throw new CodeQuestServiceError.CodeQuestNotFound('User with username \"' + author + '\" does not exist')
        }
    }
    async getCodeQuestsByLanguage(languageName: String, versions: String[]): Promise<CodeQuest[]> {
        const language = LanguageFactory.newLanguage(languageName, versions)
        await this.#languageAvailable(language)
        try {
            return await this.codequestRepo.findCodeQuestsByLanguage(language.name)
        } catch(error) {
            throw new CodeQuestServiceError.CodeQuestNotFound('No codequest solvable with \"' + language.name + '\" language found')
        }
    }
    async updateProblem(questId: String, newProblem: Problem): Promise<void> {
        try{
            await this.codequestRepo.updateProblem(questId, newProblem)
        } catch(error) {
            throw new CodeQuestServiceError.CodeQuestNotFound('No codequest found with given id')
        }
    }
    async updateTitle(questId: String, newTitle: String): Promise<void> {
        try{
            await this.codequestRepo.updateTitle(questId, newTitle)
        } catch(error) {
            throw new CodeQuestServiceError.CodeQuestNotFound('No codequest found with given id')
        }
    }
    async updateLanguages(questId: String, newLanguages: Language[]): Promise<void> {
        for (const lang of newLanguages) {
            await this.#languageAvailable(lang);
        }
        try {
            await this.codequestRepo.updateLanguages(questId, newLanguages)
        } catch(error) {
            throw new CodeQuestServiceError.CodeQuestNotFound('No codequest found with given id')
        }
    }
    async delete(questId: String): Promise<void> {
        try {
            await this.codequestRepo.delete(questId)
        } catch(error) {
            throw new CodeQuestServiceError.CodeQuestNotFound('No codequest found with given id')
        }
    }
    #languageAvailable = async (language: Language): Promise<void> => {
        let foundLanguage = await this.languageRepo.findLanguage(language.name).catch(() => {
            throw new CodeQuestServiceError.LanguageNotFound('This language is not available')
        })
        if (foundLanguage == null || language.versions.every(v => !foundLanguage.versions.includes(v))) {
            throw new CodeQuestServiceError.LanguageVersionNotFound('This language version is not available')
        }
    }
}