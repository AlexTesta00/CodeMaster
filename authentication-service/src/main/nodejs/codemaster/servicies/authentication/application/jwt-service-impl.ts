import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { JWTService } from "./jwt-service";
import { AuthenticationServiceError } from "./authentication-service";


export class JWTServiceImpl implements JWTService{
    private readonly accessSecret: string;
    private readonly refreshSecret: string;

    constructor(){
        dotenv.config();
        this.accessSecret = process.env.ACCESS_SECRET || "access";
        this.refreshSecret = process.env.REFRESH_SECRET || "refresh";
    }

    generateAccessToken(nickname: string, email: string): string {
        return jwt.sign({nickname: nickname, email: email}, this.accessSecret, {expiresIn: "1d"});
    }
    generateRefreshToken(nickname: string, email: string): string {
        return jwt.sign({nickname: nickname, email: email }, this.refreshSecret, {expiresIn: "1w"});
    }

    verifyAccessToken(token: string): string | JwtPayload{
        try {
            return jwt.verify(token, this.accessSecret);   
        } catch (error) {
            void error;
            throw new AuthenticationServiceError.InvalidAccessToken();
        }
    }
    verifyRefreshToken(token: string): string | JwtPayload {
        try {
            return jwt.verify(token, this.refreshSecret);   
        } catch (error) {
            void error;
            throw new AuthenticationServiceError.InvalidRefreshToken();
        }
    }
    
}