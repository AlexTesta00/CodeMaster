import {ErrorRequestHandler} from "express";
import {AuthenticationServiceError} from "../application/authentication-service";
import {BAD_REQUEST, CONFLICT, INTERNAL_ERROR} from "./status";
import {UserFactoryError} from "../domain/user-factory";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if(error instanceof AuthenticationServiceError.InvalidCredential){
        res.status(BAD_REQUEST).json({message: error.message, success: false});
    }
    if(error instanceof AuthenticationServiceError.InvalidRefreshToken){
        res.status(INTERNAL_ERROR).json({message: error.message, success: false});
    }
    if(error instanceof AuthenticationServiceError.InvalidPasswordFormat){
        res.status(BAD_REQUEST).json({message: error.message, success: false});
    }
    if(error instanceof AuthenticationServiceError.UserAlreadyExist){
        res.status(CONFLICT).json({message: error.message, success: false});
    }
    if(error instanceof UserFactoryError.InvalidNickname){
        res.status(BAD_REQUEST).json({message: error.message, success: false});
    }
    if(error instanceof UserFactoryError.InvalidEmail){
        res.status(BAD_REQUEST).json({message: error.message, success: false});
    }
}