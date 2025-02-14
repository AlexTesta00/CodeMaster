import { User } from './user';

export interface UserFactory {
    createUser(nickname: string, email: string, password: string): User;
}

export class UserFactoryError {
    static InvalidNickname = class extends Error{};
    static InvalidEmail = class extends Error{};
    static InvalidPassword = class extends Error{};
}