import {
    AuthenticationService, AuthenticationServiceError
} from "../../main/nodejs/codemaster/servicies/authentication/application/authentication-service";
import {
    AuthenticationServiceImpl
} from "../../main/nodejs/codemaster/servicies/authentication/application/authentication-service-impl";
import {JWTService} from "../../main/nodejs/codemaster/servicies/authentication/application/jwt-service";
import {JWTServiceImpl} from "../../main/nodejs/codemaster/servicies/authentication/application/jwt-service-impl";
import {User} from "../../main/nodejs/codemaster/servicies/authentication/domain/user";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {UserModel} from "../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-model";
import {UserFactoryError} from "../../main/nodejs/codemaster/servicies/authentication/domain/user-factory";
import {JwtPayload} from "jsonwebtoken";

describe("Test authentication service", () => {
    let mongoServer: MongoMemoryServer;
    let newUser: User;
    const nickname: string = "example";
    const email: string = "test@example.com";
    const password: string = "Test1234!";
    const wrongEmail: string = "thisemailnotExist@gmail.com";
    const wrongNickname: string = "example1234567890";
    const wrongEmailFormat: string = "example.com";
    const wrongNicknameFormat: string = "example123@$%#$@%";
    const authenticationService: AuthenticationService = new AuthenticationServiceImpl();
    const jwtService: JWTService = new JWTServiceImpl();
    const timeout: number = 10000;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    }, timeout);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    }, timeout);

    afterEach(async () => {
        await UserModel.deleteMany({});
    }, timeout);

    describe("Test register user", () => {

        beforeEach(async () => {
            newUser = await authenticationService.registerUser(nickname, email, password);
        }, timeout);

        it("should new user have a correct value", async () => {
            expect(newUser.id.value).toBe(nickname);
            expect(newUser.email).toBe(email);
        }, timeout);

        it("should new user is present in db with correct value", async () => {
            const foundUser = await UserModel.findOne({nickname: nickname}).exec();
            expect(foundUser?.email).toBe(email);
            expect(foundUser?.nickname).toBe(nickname);
            expect(foundUser?.refreshToken).toBe('');
        }, timeout);

        it('should fail if user already exists', async () => {
            const foundUser = await UserModel.findOne({nickname: nickname}).exec();
            expect(foundUser).not.toBe(null);
            await expect(authenticationService.registerUser(nickname, email, password)).rejects.toThrow();
        }, timeout);

        it('should fail if user insert incorrect nickname format', async () => {
            const incorrectNickname: string = "test!@$#@$!";
            await expect(authenticationService.registerUser(incorrectNickname, email, password)).rejects.toThrow(UserFactoryError.InvalidNickname);
        }, timeout);

        it('should fail if user insert incorrect email format', async () => {
            const incorrectEmail: string = "example.com";
            await expect(authenticationService.registerUser(nickname, incorrectEmail, password)).rejects.toThrow(UserFactoryError.InvalidEmail);
        }, timeout);

        it('should fail if user insert incorrect password format', async () => {
            const incorrectPassword: string = "example";
            await expect(authenticationService.registerUser(nickname, email, incorrectPassword)).rejects.toThrow(AuthenticationServiceError.InvalidPasswordFormat);
        }, timeout);
    });

    describe("Test login", () => {

        beforeEach(async () => {
            newUser = await authenticationService.registerUser(nickname, email, password);
        }, timeout);

        it('should return an access token if user insert a valid credentials (only nickname and password)', async () => {
            const token: string = await authenticationService.loginUser(nickname, password);
            expect(token).not.toBeNull();
            expect(token).not.toBe('');
            const decoded: string | JwtPayload = jwtService.verifyAccessToken(token);
            expect((decoded as JwtPayload).nickname).toBe(nickname);
            expect((decoded as JwtPayload).email).toBe(email);
        }, timeout);

        it('should return an access token if user insert a valid credentials (only email and password)', async () => {
            const token: string = await authenticationService.loginUser(email, password);
            expect(token).not.toBe('');
            const decoded: string | JwtPayload = jwtService.verifyAccessToken(token);
            expect((decoded as JwtPayload).nickname).toBe(nickname);
            expect((decoded as JwtPayload).email).toBe(email);
        }, timeout);

        it('should have updated refresh token section in db', async () => {
            await authenticationService.loginUser(email, password);
            const foundUser = await UserModel.findOne({nickname: nickname}).exec();
            const refreshToken: string | undefined = foundUser?.refreshToken;
            expect(refreshToken).toBeDefined();
            const decoded: string | JwtPayload = jwtService.verifyRefreshToken(refreshToken!);
            expect((decoded as JwtPayload).nickname).toBe(nickname);
            expect((decoded as JwtPayload).email).toBe(email);
        }, timeout);

        it('should return an error if user insert a wrong email', async () => {
            await expect(authenticationService.loginUser(wrongEmail, password)).rejects.toThrow(AuthenticationServiceError.InvalidCredential);
        }, timeout);

        it('should return an error if user insert a wrong nickname', async () => {
            await expect(authenticationService.loginUser(wrongNickname, password)).rejects.toThrow(AuthenticationServiceError.InvalidCredential);
        }, timeout);

        it('should return an error if user insert an incorrect email format', async () => {
            await expect(authenticationService.loginUser(wrongEmailFormat, password)).rejects.toThrow(AuthenticationServiceError.InvalidCredential);
        }, timeout);

        it('should return an error if user insert an incorrect nickname format', async () => {
            await expect(authenticationService.loginUser(wrongNicknameFormat, password)).rejects.toThrow(AuthenticationServiceError.InvalidCredential);
        }, timeout);
    });

    describe("Test logout", () => {
        beforeAll(async () => {
            await authenticationService.registerUser(nickname, email, password);
            await authenticationService.loginUser(nickname, password);
        }, timeout);

        it('should success for correct logout', async () => {
            await authenticationService.logoutUser(nickname);
            const foundUser = await UserModel.findOne({nickname: nickname}).exec();
            expect(foundUser?.refreshToken).toBe('');
        }, timeout);

        it('should fail because user nickname not exist', async () => {
            await expect(authenticationService.logoutUser(wrongNickname)).rejects.toThrow(AuthenticationServiceError.InvalidCredential);
        }, timeout);

        it('should fail because user email not exist', async () => {
            await expect(authenticationService.logoutUser(wrongEmail)).rejects.toThrow(AuthenticationServiceError.InvalidCredential);
        }, timeout);

    });

    describe("Test refresh token", () => {

        beforeAll(async () => {
            await authenticationService.registerUser(nickname, email, password);
        }, timeout);

        it('should return a new access token if the refresh token is valid', async () => {
            await authenticationService.loginUser(nickname, password);
            const newAccessToken: string = await authenticationService.refreshAccessUserToken(nickname);
            const decoded: string | JwtPayload = jwtService.verifyAccessToken(newAccessToken);
            expect((decoded as JwtPayload).nickname).toBe(nickname);
            expect((decoded as JwtPayload).email).toBe(email);
        }, timeout);

        /*
        it('should fail if the user has never logged in', async () => {
            await expect(authenticationService.refreshAccessUserToken(nickname)).rejects.toThrow(AuthenticationServiceError.InvalidRefreshToken);
        }, timeout);
        */

        it('should fail if the user not exist', async () => {
            await expect(authenticationService.refreshAccessUserToken(wrongNickname)).rejects.toThrow(AuthenticationServiceError.InvalidCredential);
        }, timeout);
    });

});