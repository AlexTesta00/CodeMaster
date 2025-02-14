import { User } from './user';
import { UserId } from './user-id';
import { UserFactory, UserFactoryError } from './user-factory';

export class UserFactoryImpl implements UserFactory {

    private NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,10}$/; //Only letter, number and underscore. Min 3, max 10 characters
    private EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    private PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/

    createUser(nickname: string, email: string, password: string): User {
        if(!this.NICKNAME_REGEX.test(nickname)){
            throw new UserFactoryError.InvalidNickname('Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters');
        }

        if(!this.EMAIL_REGEX.test(email)){
            throw new UserFactoryError.InvalidEmail('Invalid email format');
        }

        if(!this.PASSWORD_REGEX.test(password)){
            throw new UserFactoryError.InvalidPassword('Invalid password format, at least 8 characters, one uppercase letter, one number and one special character');
        }

        return new User(new UserId(nickname), email, password);
    }
}