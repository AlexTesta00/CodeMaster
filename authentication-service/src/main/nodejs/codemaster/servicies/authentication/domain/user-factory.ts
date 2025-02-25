import { User } from './user';
import { UserId } from './user-id';
import {Validator} from "./validator";

export class UserFactory {
    static createUser(nickname: string, email: string, password: string): User {
        if(!Validator.isValidNickname(nickname)){
            throw new UserFactoryError.InvalidNickname('Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters');
        }

        if(!Validator.isValidEmail(email)){
            throw new UserFactoryError.InvalidEmail('Invalid email format');
        }

        if(!Validator.isValidPassword(password)){
            throw new UserFactoryError.InvalidPassword('Invalid password format, at least 8 characters, one uppercase letter, one number and one special character');
        }

        return new User(new UserId(nickname), email, password);
    }
}

export class UserFactoryError {
    static InvalidNickname = class extends Error{};
    static InvalidEmail = class extends Error{};
    static InvalidPassword = class extends Error{};
}