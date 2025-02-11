import bcrypt from 'bcrypt';
import { User } from '../domain/user';
import { UserId } from '../domain/user-id';

export class UserFactory {

    private static NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,10}$/; //Only letter, number and underscore. Min 3, max 10 characters
    private static EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    private static PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/

    static async createUser(nickname: string, email: string, password: string): Promise<[User, string]> {
        if(!this.NICKNAME_REGEX.test(nickname)){
            throw new Error('Invalid nickname: must contain only letters, numbers or underscores and be between 3 and 10 characters long.');
        }

        if(!this.EMAIL_REGEX.test(email)){
            throw new Error('Invalid email format');
        }

        if(!this.PASSWORD_REGEX.test(password)){
            throw new Error('Invalid password: must contain at least 8 characters, one uppercase letter, one number and one special character.');
        }

        const salt = await bcrypt.genSalt(16);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User(new UserId(nickname), email, hashedPassword);
        return [user, salt];
    }
}