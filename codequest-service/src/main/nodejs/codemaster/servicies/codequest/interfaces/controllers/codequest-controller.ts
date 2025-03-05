import mongoose from "mongoose";
import { Request, Response } from "express";
import { CodeQuestFactory } from "../../domain/codequest-factory";
import { CodeQuestRepositoryImpl } from "../../infrastructure/codequest-repository-impl";

class Controller {

    private repository = new CodeQuestRepositoryImpl();

    listCodeQuest = async (req: Request, res: Response) => {
        res.json(await this.repository.getAllCodeQuests());
    } 

    addCodeQuest = async (req: Request, res: Response) => {
        const newCodequest = CodeQuestFactory.createCodeQuest(new mongoose.Types.ObjectId().toString(), req.body.title, req.body.author, req.body.problem, new Date());
        res.json(await this.repository.save(newCodequest));
    }

    getCodeQuestById = async (req: Request, res: Response) => {
        res.json(await this.repository.findCodeQuestById(req.params.id));
    }

    deleteCodeQuest = async (req: Request, res: Response) => {
        res.json(await this.repository.delete(req.params.id));
    }

    getCodeQuestsByAuthor = async (req: Request, res: Response) => {
        res.json(await this.repository.findCodeQuestsByAuthor(req.params.author));
    }

    updateProblem = async (req: Request, res: Response) => {
        res.json(await this.repository.updateProblem(req.params.id, req.body.problem));
    }

    updateTitle = async (req: Request, res: Response) => {
        res.json(await this.repository.updateProblem(req.params.id, req.body.title));
    }
}

export default Controller;