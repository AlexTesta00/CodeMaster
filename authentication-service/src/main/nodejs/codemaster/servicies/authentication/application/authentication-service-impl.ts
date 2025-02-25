import bcrypt from "bcrypt";
import { User } from "../domain/user";
import { UserFactory } from "../domain/user-factory";
import { UserRepository } from "../infrastructure/user-repository";
import { UserRepositoryImpl } from "../infrastructure/user-repository-impl";
import { AuthenticationService, AuthenticationServiceError } from "./authentication-service";
import { JWTService } from "./jwt-service";
import { JWTServiceImpl } from "./jwt-service-impl";
import {Validator} from "../domain/validator";

export class AuthenticationServiceImpl implements AuthenticationService {

    private userRepository: UserRepository = new UserRepositoryImpl();
    private jwtService: JWTService = new JWTServiceImpl();
    
    async registerUser(nickname: string, email: string, password: string): Promise<User> {
        const newUser = UserFactory.createUser(nickname, email, password);
        await this.userRepository.save(newUser);
        return newUser;
    }

    async loginUser(id: string, password: string): Promise<string> {
        const user: User = await this.#verifyUser(id);

        if(!await bcrypt.compare(password, user.password)){
            throw new AuthenticationServiceError.InvalidCredential();
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
            throw new AuthenticationServiceError.InvalidRefreshToken();
        }

        try{
            this.jwtService.verifyRefreshToken(refreshToken);
        }catch(error){
            void error
            throw new AuthenticationServiceError.InvalidRefreshToken();
        }

        return this.jwtService.generateAccessToken(user.id.value, user.email);
    }

    #verifyUser = async (id: string): Promise<User> => {

        if(Validator.isValidNickname(id)){
            try {
                return await this.userRepository.findUserByNickname(id);
            }catch (error) {
                throw new AuthenticationServiceError.InvalidCredential();
            }
        }

        if(Validator.isValidEmail(id)){
            try{
                return await this.userRepository.findUserByEmail(id);
            }catch (error) {
                throw new AuthenticationServiceError.InvalidCredential();
            }
        }

        throw new AuthenticationServiceError.InvalidCredential();
    }
}
