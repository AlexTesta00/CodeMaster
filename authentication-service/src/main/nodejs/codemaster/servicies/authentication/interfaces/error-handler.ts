import {ErrorRequestHandler} from "express";
import {AuthenticationServiceError} from "../application/authentication-service";
import {UNAUTHORIZED} from "./status";
import {UserFactoryError} from "../domain/user-factory";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if(error instanceof AuthenticationServiceError.InvalidCredential){
        res.status(UNAUTHORIZED).json({message: error.message, success: false});
    }
    if(error instanceof AuthenticationServiceError.InvalidRefreshToken){
        res.status(UNAUTHORIZED).json({message: error.message, success: false});
    }
    if(error instanceof AuthenticationServiceError.InvalidPasswordFormat){
        res.status(UNAUTHORIZED).json({message: error.message, success: false});
    }
    if(error instanceof AuthenticationServiceError.UserAlreadyExist){
        res.status(UNAUTHORIZED).json({message: error.message, success: false});
    }
    if(error instanceof UserFactoryError.InvalidNickname){
        res.status(UNAUTHORIZED).json({message: error.message, success: false});
    }
    if(error instanceof UserFactoryError.InvalidEmail){
        res.status(UNAUTHORIZED).json({message: error.message, success: false});
    }
}