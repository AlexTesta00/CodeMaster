import { Router } from 'express'
import {
  computeLevel,
  getUser,
  healthCheck,
  registerUser,
  removeUser,
  updateUserBio,
  updateUserCV,
  updateUserLanguages,
  updateUserProfilePicture,
  updateUserTrophies,
  getAllUsers,
} from './user-controller'

const userRouter: Router = Router()

userRouter.get('/status', healthCheck)
userRouter.post('/register', registerUser)
userRouter.get('/:nickname', getUser)
userRouter.get('/', getAllUsers)
userRouter.put('/bio', updateUserBio)
userRouter.put('/profile-picture', updateUserProfilePicture)
userRouter.put('/cv', updateUserCV)
userRouter.put('/languages', updateUserLanguages)
userRouter.put('/trophies', updateUserTrophies)
userRouter.get('/level/:nickname', computeLevel)
userRouter.delete('/:nickname', removeUser)

export { userRouter }
