import { Router } from 'express'
import {
  computeLevel,
  getUser,
  registerUser,
  removeUser,
  updateUserBio,
  updateUserCV,
  updateUserLanguages,
  updateUserProfilePicture,
  updateUserTrophies,
} from './user-controller'

const userRouter: Router = Router()

userRouter.post('/register', registerUser)
userRouter.get('/:nickname', getUser)
userRouter.put('/bio', updateUserBio)
userRouter.put('/profile-picture', updateUserProfilePicture)
userRouter.put('/cv', updateUserCV)
userRouter.put('/languages', updateUserLanguages)
userRouter.put('/trophies', updateUserTrophies)
userRouter.get('/level/:nickname', computeLevel)
userRouter.delete('/:nickname', removeUser)

export { userRouter }
