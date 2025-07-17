import { Router } from 'express'
import Controller from './codequest-controller'

export function createCodeQuestRouter(controller: Controller): Router {
  const router = Router()

  router.route('/').get(controller.listCodeQuest).post(controller.addCodeQuest)

  router.route('/authors/:author').get(controller.getCodeQuestsByAuthor)

  router.route('/languages').get(controller.getCodeQuestsByLanguage)

  router.route('/difficulty').get(controller.getCodeQuestsByDifficulty)

  router.route('/health').get(controller.healthCheck)

  router.route('/:id').get(controller.getCodeQuestById).delete(controller.deleteCodeQuest)

  router.route('/codequest-problem/:id').put(controller.updateProblem)

  router.route('/codequest-title/:id').put(controller.updateTitle)

  router.route('/codequest-languages/:id').put(controller.updateLanguages)

  router.route('/codequest-difficulty/:id').put(controller.updateDifficulty)

  return router
}
