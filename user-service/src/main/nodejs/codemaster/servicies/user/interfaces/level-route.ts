import { Router } from 'express'
import { addLevel, getLevels, removeLevel } from './level-controller'

const levelRouter: Router = Router()

levelRouter.post('/', addLevel) //TODO: FIXME: level create /create not / (root)
levelRouter.delete('/:grade', removeLevel)
levelRouter.get('/', getLevels)

export { levelRouter }
