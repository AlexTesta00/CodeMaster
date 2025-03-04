import {AuthenticationService, AuthenticationServiceError} from "../application/authentication-service";
import { AuthenticationServiceImpl } from "../application/authentication-service-impl";
import {NextFunction, Request, Response} from "express";
import {User} from "../domain/user";
import {CREATED, OK} from "./status";
import {UserId} from "../domain/user-id";

const authenticationService: AuthenticationService = new AuthenticationServiceImpl();

export const registerNewUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { nickname, email, password } = req.body;

    try {
        const user: User = await authenticationService.registerUser(new UserId(nickname), email, password);
        res.status(CREATED).json({message: "User registered", success: true, user})
    }catch (error) {
        next(error);
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { nickname, email, password } = req.body;
    let token: string;

    try{
        if(nickname){
            token = await authenticationService.loginUser(new UserId(nickname), password);
        }else{
            token = await authenticationService.loginUser(email, password);
        }

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, //Expire in one day
            sameSite: "strict"
        });

        res.status(OK).json({ message: "User LoggedIn", success: true, token: token}).end();
    }catch (error){
        next(error);
    }
}

export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { nickname, email } = req.body;

    try{
        if(nickname){
            await authenticationService.logoutUser(new UserId(nickname));
        }else{
            await authenticationService.logoutUser(email);
        }

        res.clearCookie("auth_token");

        res.status(OK).json({ message: "User LoggedOut", success: true}).end();
    }catch (error){
        next(error);
    }
}

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { nickname, email } = req.body;
    let accessToken: string;

    try{
        if(nickname){
            accessToken = await authenticationService.refreshAccessUserToken(new UserId(nickname));
        }else{
            accessToken = await authenticationService.refreshAccessUserToken(email);
        }
        res.status(OK).json({ message: "User Access Token refreshed", success: true, token: accessToken}).end();
    }catch (error){
        next(error);
    }
}

export const updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {nickname, newEmail} = req.body;

    try {
        await authenticationService.updateUserEmail(new UserId(nickname), newEmail);
        res.status(OK).json({ message: "Email updated", success: true}).end();
    }catch (error) {
        next(error);
    }
}

export const updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {nickname, oldPassword, newPassword} = req.body;

    try {
        await authenticationService.updateUserPassword(new UserId(nickname), oldPassword, newPassword);
        res.status(OK).json({ message: "Password updated", success: true}).end();
    }catch (error){
        next(error);
    }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const nickname: string = req.params.id;

    try {
        await authenticationService.deleteUser(new UserId(nickname));
        res.status(OK).json({ message: "User deleted", success: true}).end();
    }catch (error) {
        next(error);
    }
}