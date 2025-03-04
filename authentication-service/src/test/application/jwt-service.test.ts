import jwt, {JwtPayload} from 'jsonwebtoken';
import { JWTService } from "../../main/nodejs/codemaster/servicies/authentication/application/jwt-service";
import { JWTServiceImpl} from "../../main/nodejs/codemaster/servicies/authentication/application/jwt-service-impl";
import {
    AuthenticationServiceError
} from "../../main/nodejs/codemaster/servicies/authentication/application/authentication-service";

describe('Test JWT Service', () => {
    const timeout: number = 10000;
    const nickname: string = "example";
    const email: string = 'test@test.com';
    let jwtService: JWTService;
    let accesstoken: string;
    let refreshToken: string;

    beforeAll(() => {
        jwtService = new JWTServiceImpl();
        accesstoken = jwtService.generateAccessToken(nickname, email);
        refreshToken = jwtService.generateRefreshToken(nickname, email);
    });

    describe('Test access token', () => {
        it('should generate a valid access token', () => {
            expect(accesstoken).toBeDefined();
            expect(typeof accesstoken).toBe('string');
            const decoded = jwt.verify(accesstoken, 'access') as JwtPayload;
            expect(decoded.nickname).toBe(nickname);
            expect(decoded.email).toBe(email);
        }, timeout);

        it('should verify a valid access token', () => {
            const decoded = jwtService.verifyAccessToken(accesstoken);
            expect(decoded).toBeDefined();
            expect((decoded as JwtPayload).nickname).toBe(nickname);
            expect((decoded as JwtPayload).email).toBe(email);
        }, timeout);

        it('should reject if access token is invalid', () => {
            const invalidToken = "invalid.invalid";
            expect(() => jwtService.verifyAccessToken(invalidToken)).toThrow(AuthenticationServiceError.InvalidAccessToken);
        }, timeout);
    });

    describe("Test refresh token", () => {
        it('should generate a valid refresh token', () => {
            expect(refreshToken).toBeDefined();
            expect(typeof refreshToken).toBe('string');
            const decoded = jwt.verify(refreshToken, 'refresh') as JwtPayload;
            expect(decoded.nickname).toBe(nickname);
            expect(decoded.email).toBe(email);
        }, timeout);

        it('should verify a valid refresh token', () => {
            const decoded = jwtService.verifyRefreshToken(refreshToken);
            expect(decoded).toBeDefined();
            expect((decoded as JwtPayload).nickname).toBe(nickname);
            expect((decoded as JwtPayload).email).toBe(email);
        }, timeout);

        it('should reject if refresh token is invalid', () => {
            const invalidToken = "invalid.invalid";
            expect(() => jwtService.verifyRefreshToken(invalidToken)).toThrow(AuthenticationServiceError.InvalidRefreshToken);
        }, timeout);
    });
})