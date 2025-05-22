import { Router } from 'express'
import * as AuthenticationController from './authentication-controller'
import { userIsAlreadyAuthenticated } from './cookie-handler'

const router: Router = Router()

router.post('/register', AuthenticationController.registerNewUser)
router.post('/login', userIsAlreadyAuthenticated, AuthenticationController.loginUser)
router.post('/logout', AuthenticationController.logoutUser)
router.post('/refresh-access-token', AuthenticationController.refreshAccessToken)
router.patch('/update-email', AuthenticationController.updateEmail)
router.patch('/update-password', AuthenticationController.updatePassword)
router.delete('/:id', AuthenticationController.deleteUser)
router.patch('/ban', AuthenticationController.banUser)
router.patch('/unban', AuthenticationController.unbanUser)

export { router }
