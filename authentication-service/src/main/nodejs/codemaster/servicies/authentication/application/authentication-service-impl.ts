import { User } from "../domain/user";
import { UserFactory } from "../domain/user-factory";
import { UserRepository } from "../infrastructure/user-repository";
import { UserRepositoryImpl } from "../infrastructure/user-repository-impl";
import {AuthenticationService, AuthenticationServiceError, UserIdentifier} from "./authentication-service";
import { JWTService } from "./jwt-service";
import { JWTServiceImpl } from "./jwt-service-impl";
import {Validator} from "../domain/validator";
import {BcryptService} from "./bcrypt-service";
import {UserId} from "../domain/user-id";

export class AuthenticationServiceImpl implements AuthenticationService {

    private userRepository: UserRepository = new UserRepositoryImpl();
    private jwtService: JWTService = new JWTServiceImpl();
    
    async registerUser(nickname: UserId, email: string, password: string): Promise<User> {
        if(!Validator.isValidPassword(password)){
            throw new AuthenticationServiceError.InvalidPasswordFormat("Invalid password format, at least 8 characters, one uppercase letter, one number and one special character");
        }
        const hashedPassword: string = await BcryptService.generateHashForPassword(password);
        const newUser = UserFactory.createUser(nickname, email, hashedPassword);
        await this.userRepository.save(newUser).catch(() => {throw new AuthenticationServiceError.UserAlreadyExist("User already exist")});
        return newUser;
    }

    async loginUser(id: UserIdentifier, password: string): Promise<string> {
        const user: User = await this.#verifyUser(id);

        if(!await BcryptService.isSamePassword(user.password, password)){
            throw new AuthenticationServiceError.InvalidCredential("Invalid Credentials");
        }

        const accesToken = this.jwtService.generateAccessToken(user.id.value, user.email);
        const refreshToken = this.jwtService.generateRefreshToken(user.id.value, user.email);

        await this.userRepository.updateUserRefreshToken(user.id, refreshToken);

        return accesToken;
    }

    async logoutUser(id: UserIdentifier): Promise<void> {
        const user: User = await this.#verifyUser(id);
        await this.userRepository.updateUserRefreshToken(user.id, "");
    }

    async deleteUser(id: UserIdentifier): Promise<void> {
        const user: User = await this.#verifyUser(id);
        await this.userRepository.deleteUser(user.id).catch(() => { throw new AuthenticationServiceError.InvalidCredential("User not found")});
    }

    async updateUserEmail(id: UserIdentifier, newEmail: string): Promise<void> {
        if(!Validator.isValidEmail(newEmail)){
            throw new AuthenticationServiceError.InvalidCredential("Invalid email format");
        }
        const user: User = await this.#verifyUser(id);
        await this.userRepository.updateUserEmail(user.id, newEmail).catch(() => { throw new AuthenticationServiceError.InvalidCredential("User not found")});
    }

    async updateUserPassword(id: UserIdentifier, oldPassword: string, newPassword: string): Promise<void> {
        if(!Validator.isValidPassword(newPassword)){
            throw new AuthenticationServiceError.InvalidCredential("Invalid password format");
        }

        const user: User = await this.#verifyUser(id);
        if(!await BcryptService.isSamePassword(user.password, oldPassword)){
            throw new AuthenticationServiceError.InvalidCredential("Old password does not match");
        }
        const hashedPassword: string = await BcryptService.generateHashForPassword(newPassword);
        await this.userRepository.updateUserPassword(user.id, hashedPassword);
    }

    async refreshAccessUserToken(id: UserIdentifier): Promise<string> {
        const user = await this.#verifyUser(id);
        const refreshToken = await this.userRepository.getUserRefreshToken(user.id);

        if(!refreshToken){
            throw new AuthenticationServiceError.InvalidRefreshToken("Invalid RefreshToken");
        }

        try{
            this.jwtService.verifyRefreshToken(refreshToken);
        }catch(error){
            void error
            throw new AuthenticationServiceError.InvalidRefreshToken("Invalid RefreshToken");
        }

        return this.jwtService.generateAccessToken(user.id.value, user.email);
    }

    #verifyUser = async (id: UserIdentifier): Promise<User> => {
        if(id instanceof UserId){
            try {
                return await this.userRepository.findUserByNickname(id);
            }catch (error) {
                throw new AuthenticationServiceError.InvalidCredential("User not found");
            }
        }else{
            try {
                return await this.userRepository.findUserByEmail(id);
            }catch (error) {
                throw new AuthenticationServiceError.InvalidCredential("User not found");
            }
        }
    }

}
