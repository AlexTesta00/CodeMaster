import { User } from "../domain/user";
import { UserFactory } from "../domain/user-factory";
import { UserRepository } from "../infrastructure/user-repository";
import { UserRepositoryImpl } from "../infrastructure/user-repository-impl";
import { AuthenticationService, AuthenticationServiceError } from "./authentication-service";
import { JWTService } from "./jwt-service";
import { JWTServiceImpl } from "./jwt-service-impl";
import {Validator} from "../domain/validator";
import {BcryptService} from "./bcrypt-service";

export class AuthenticationServiceImpl implements AuthenticationService {

    private userRepository: UserRepository = new UserRepositoryImpl();
    private jwtService: JWTService = new JWTServiceImpl();
    
    async registerUser(nickname: string, email: string, password: string): Promise<User> {
        if(!Validator.isValidPassword(password)){
            throw new AuthenticationServiceError.InvalidPasswordFormat("Invalid password format, at least 8 characters, one uppercase letter, one number and one special character");
        }
        const hashedPassword: string = await BcryptService.generateHashForPassword(password);
        const newUser = UserFactory.createUser(nickname, email, hashedPassword);
        await this.userRepository.save(newUser).catch(() => {throw new AuthenticationServiceError.UserAlreadyExist("User already exist")});
        return newUser;
    }

    async loginUser(id: string, password: string): Promise<string> {
        const user: User = await this.#verifyUser(id);

        if(!await BcryptService.isSamePassword(user.password, password)){
            throw new AuthenticationServiceError.InvalidCredential("Invalid Credentials");
        }

        const accesToken = this.jwtService.generateAccessToken(user.id.value, user.email);
        const refreshToken = this.jwtService.generateRefreshToken(user.id.value, user.email);

        await this.userRepository.updateUserRefreshToken(user.id.value, refreshToken);

        return accesToken;
    }

    async logoutUser(id: string): Promise<void> {
        const user: User = await this.#verifyUser(id);
        await this.userRepository.updateUserRefreshToken(user.id.value, "");
    }

    async refreshAccessUserToken(id: string): Promise<string> {
        const user = await this.#verifyUser(id);
        const refreshToken = await this.userRepository.getUserRefreshToken(user.id.value);

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

    #verifyUser = async (id: string): Promise<User> => {

        if(Validator.isValidNickname(id)){
            try {
                return await this.userRepository.findUserByNickname(id);
            }catch (error) {
                throw new AuthenticationServiceError.InvalidCredential("User not found");
            }
        }

        if(Validator.isValidEmail(id)){
            try{
                return await this.userRepository.findUserByEmail(id);
            }catch (error) {
                throw new AuthenticationServiceError.InvalidCredential("User not found");
            }
        }

        throw new AuthenticationServiceError.InvalidCredential("User not found");
    }
}
