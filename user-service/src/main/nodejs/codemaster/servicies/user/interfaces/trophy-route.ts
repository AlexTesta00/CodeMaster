import { Router } from 'express'
import { addTrophy, getTrophies, removeTrophy } from './trophy-controller'

const trophyRouter: Router = Router()

trophyRouter.post('/', addTrophy) //TODO: fix /create not /
trophyRouter.delete('/trophies/:trophyId', removeTrophy)
trophyRouter.get('/', getTrophies)

export { trophyRouter }
