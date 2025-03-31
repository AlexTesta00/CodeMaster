import {NextFunction, Request, Response} from "express";
import {CodeQuestServiceImpl} from "../application/codequest-service-impl";
import {CREATED} from "./status";

class Controller {
    private service = new CodeQuestServiceImpl();

    listCodeQuest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const codequests = await this.service.getCodeQuests()
            res.status(CREATED).json({message: 'Codequests get', success: true, codequests})
        } catch(error) {
            next(error)
        }
    } 

    addCodeQuest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const codequest = await this.service.addCodeQuest(req.body.title, req.body.author, req.body.problem, null, req.body.languages)
            res.status(CREATED).json({message: 'Codequests get', success: true, codequest})
        } catch(error) {
            next(error)
        }
    }

    getCodeQuestById = async (req: Request, res: Response, next: NextFunction) => {
        res.json(await this.service.getCodeQuestById(req.params.id));
    }

    getCodeQuestsByLanguage = async (req: Request, res: Response, next: NextFunction) => {
        res.json(await this.service.getCodeQuestsByLanguage(req.body.language.name, req.body.language.versions))
    }

    getCodeQuestsByAuthor = async (req: Request, res: Response, next: NextFunction) => {
        res.json(await this.service.getCodeQuestsByAuthor(req.params.author));
    }

    updateProblem = async (req: Request, res: Response, next: NextFunction) => {
        res.json(await this.service.updateProblem(req.params.id, req.body.problem));
    }

    updateTitle = async (req: Request, res: Response, next: NextFunction) => {
        res.json(await this.service.updateProblem(req.params.id, req.body.title));
    }

    updateLanguages = async (req: Request, res: Response, next: NextFunction) => {
        res.json(await this.service.updateLanguages(req.params.id, req.body.languages))
    }

    deleteCodeQuest = async (req: Request, res: Response, next: NextFunction) => {
        res.json(await this.service.delete(req.params.id));
    }
}

export default Controller;