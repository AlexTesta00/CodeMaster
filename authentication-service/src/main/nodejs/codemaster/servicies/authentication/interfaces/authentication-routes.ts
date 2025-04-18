import { Router } from 'express'
import * as AuthenticationController from './authentication-controller'
import { userIsAlreadyAuthenticated } from './cookie-handler'

const router: Router = Router()

router.post('/register', AuthenticationController.registerNewUser)
router.post('/login', userIsAlreadyAuthenticated, AuthenticationController.loginUser)
router.post('/logout', AuthenticationController.logoutUser)
router.post('/refresh-access-token', AuthenticationController.refreshAccessToken)
router.put('/update-email', AuthenticationController.updateEmail)
router.put('/update-password', AuthenticationController.updatePassword)
router.delete('/:id', AuthenticationController.deleteUser)

export { router }
