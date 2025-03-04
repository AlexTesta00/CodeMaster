import { Router } from "express";
import * as AuthenticationController from "./authentication-controller";

const router: Router = Router();

router.post('/register', AuthenticationController.registerNewUser);
router.post('/login', AuthenticationController.loginUser);
router.post('/logout', AuthenticationController.logoutUser);
router.post('/refresh-access-token', AuthenticationController.refreshAccessToken);
router.put('/update-email', AuthenticationController.updateEmail);
router.put('/update-password', AuthenticationController.updatePassword);
router.delete('/:id', AuthenticationController.deleteUser);

export {router};