import { User } from './user';
import { UserId } from './user-id';
import { Validator } from "./validator";

export class UserFactory {
    static createUser(nickname: UserId, email: string, password: string): User {
        if(!Validator.isValidNickname(nickname.value)){
            throw new UserFactoryError.InvalidNickname('Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters');
        }

        if(!Validator.isValidEmail(email)){
            throw new UserFactoryError.InvalidEmail('Invalid email format');
        }

        return new User(nickname, email, password);
    }
}

export class UserFactoryError {
    static InvalidNickname = class extends Error{};
    static InvalidEmail = class extends Error{};
}