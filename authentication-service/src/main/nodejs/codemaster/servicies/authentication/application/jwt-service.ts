import { JwtPayload } from "jsonwebtoken";

export interface JWTService {
    generateAccessToken(nickname: string, email: string): string;
    generateRefreshToken(nickname: string, email: string): string
    verifyAccessToken(token: string): string | JwtPayload;
    verifyRefreshToken(token: string): string | JwtPayload;
}