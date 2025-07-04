import { Router } from 'express'
import { addTrophy, getTrophies, removeTrophy } from './trophy-controller'

const trophyRouter: Router = Router()

trophyRouter.post('/create', addTrophy)
trophyRouter.delete('/trophies/:trophyId', removeTrophy)
trophyRouter.get('/', getTrophies)

export { trophyRouter }
