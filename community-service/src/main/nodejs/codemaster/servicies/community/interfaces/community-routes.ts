import { Router } from 'express'
import CommunityController from './community-controller'

export function createCommunityRouter(controller: CommunityController): Router {
  const router = Router()

  router.route('/').post(controller.saveComment)

  router
    .route('/:id')
    .get(controller.getComment)
    .put(controller.changeContent)
    .delete(controller.deleteComment)

  router.route('/codequests/:questId').get(controller.getCommentsByCodequest)

  router.route('/health').get(controller.healthCheck)

  return router
}
