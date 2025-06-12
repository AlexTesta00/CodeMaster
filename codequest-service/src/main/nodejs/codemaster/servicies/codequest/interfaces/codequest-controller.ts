import { NextFunction, Request, Response } from 'express'
import { CodeQuestServiceImpl } from '../application/codequest-service-impl'
import { CREATED, INTERNAL_ERROR, OK } from './status'

class Controller {
  constructor(private readonly service: CodeQuestServiceImpl) {}

  healthCheck = async (req: Request, res: Response) => {
    const serviceReady = this.service.isServiceReady()
    if (serviceReady) {
      res.status(OK).json({ status: 'OK', success: true })
    } else {
      res.status(INTERNAL_ERROR).json({
        status: 'Service Unavailable',
        success: false,
        mongo: serviceReady,
      })
    }
  }

  listCodeQuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const codequests = await this.service.getCodeQuests()
      res.status(OK).json({ message: 'Codequests get', success: true, codequests })
    } catch (error) {
      next(error)
    }
  }

  addCodeQuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const codequest = await this.service.addCodeQuest(
        req.body.title,
        req.body.author,
        req.body.problem,
        null,
        req.body.languages,
        req.body.difficulty
      )
      res.status(CREATED).json({ message: 'Codequests add', success: true, codequest })
    } catch (error) {
      next(error)
    }
  }

  getCodeQuestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const codequest = await this.service.getCodeQuestById(req.params.id)
      res.status(OK).json({ message: 'Codequest get', success: true, codequest })
    } catch (error) {
      next(error)
    }
  }

  getCodeQuestsByLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const codequests = await this.service.getCodeQuestsByLanguage(req.body.name)
      res.status(OK).json({ message: 'Codequests get', success: true, codequests })
    } catch (error) {
      next(error)
    }
  }

  getCodeQuestsByAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const codequests = await this.service.getCodeQuestsByAuthor(req.params.author)
      res.status(OK).json({ message: 'Codequests get', success: true, codequests })
    } catch (error) {
      next(error)
    }
  }

  getCodeQuestsByDifficulty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const codequests = await this.service.getCodeQuestsByDifficulty(req.body.name)
      res.status(OK).json({ message: 'Codequests get', success: true, codequests })
    } catch (error) {
      next(error)
    }
  }

  updateProblem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.updateProblem(req.params.id, req.body.problem)
      res.status(OK).json({ message: 'Codequest put', success: true })
    } catch (error) {
      next(error)
    }
  }

  updateTitle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.updateTitle(req.params.id, req.body.title)
      res.status(OK).json({ message: 'Codequest put', success: true })
    } catch (error) {
      next(error)
    }
  }

  updateLanguages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.updateLanguages(req.params.id, req.body.languages)
      res.status(OK).json({ message: 'Codequest put', success: true })
    } catch (error) {
      next(error)
    }
  }

  updateDifficulty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.updateDifficulty(req.params.id, req.body.difficulty)
      res.status(OK).json({ message: 'Codequest put', success: true })
    } catch (error) {
      next(error)
    }
  }

  deleteCodeQuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id)
      res.status(OK).json({ message: 'Codequest delete', success: true })
    } catch (error) {
      next(error)
    }
  }
}

export default Controller
