import { CommunityServiceImpl } from '../application/community-service-impl'
import { NextFunction, Request, Response } from 'express'
import { CREATED, INTERNAL_ERROR, OK } from './status'
import { MongoConnector } from '../infrastructure/db-connection'
import { isRabbitConnected } from '../infrastructure/middleware/consumer-impl'

class CommunityController {
  constructor(private readonly service: CommunityServiceImpl) {}

  healthCheck = async (req: Request, res: Response) => {
    const mongoReady = MongoConnector.isDatabaseConnected()
    const rabbitReady = isRabbitConnected()
    if (mongoReady && rabbitReady) {
      res.status(OK).json({ status: 'OK', success: true })
    } else {
      res.status(INTERNAL_ERROR).json({
        status: 'Service Unavailable',
        success: false,
        mongo: mongoReady,
        rabbitReady: rabbitReady,
      })
    }
  }

  saveComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.addComment(
        req.body.questId,
        req.body.author,
        req.body.content
      )
      res.status(CREATED).json({ message: 'Add comment', success: true, result })
    } catch (error) {
      next(error)
    }
  }

  getComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getCommentById(req.params.id)
      res.status(OK).json({ message: 'Get comment', success: true, result })
    } catch (error) {
      next(error)
    }
  }

  getCommentsByCodequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getCommentsByCodequest(req.params.questId)
      res.status(OK).json({ message: 'Get comments', success: true, result })
    } catch (error) {
      next(error)
    }
  }

  changeContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateContent(req.params.id, req.body.content)
      res.status(OK).json({ message: 'Change comment', success: true, result })
    } catch (error) {
      next(error)
    }
  }

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteComment(req.params.id)
      res.status(OK).json({ message: 'Delete comment', success: true, result })
    } catch (error) {
      next(error)
    }
  }
}

export default CommunityController
