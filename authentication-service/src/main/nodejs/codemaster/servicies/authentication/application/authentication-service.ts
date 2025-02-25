import { User } from '../domain/user';

export interface AuthenticationService {
    registerUser(nickname: string, email: string, password: string): Promise<User>;
    loginUser(id: string, password: string): Promise<string>;
    logoutUser(id: string): Promise<void>;
    refreshAccessUserToken(id: string): Promise<string>;
}

export class AuthenticationServiceError{
    static UserAlreadyExist = class extends Error{};
    static InvalidPasswordFormat = class extends Error{}
    static InvalidCredential = class extends Error{};
    static InvalidRefreshToken = class extends Error{};
    static InvalidAccessToken = class extends Error{};
}