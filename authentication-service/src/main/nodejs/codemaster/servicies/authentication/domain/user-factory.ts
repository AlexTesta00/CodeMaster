import bcrypt from 'bcrypt';
import { User } from '../domain/User';
import { UserId } from '../domain/user-id';

export class UserFactory {

    private static NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,10}$/; //Only letter, number and underscore. Min 3, max 10 characters

    static async createUser(nickname: string, email: string, password: string): Promise<[User, string]> {
        if(!this.NICKNAME_REGEX.test(nickname)){
            throw new Error('Invalid nickname: must contain only letters, numbers or underscores and be between 3 and 10 characters long.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User(new UserId(nickname), email, hashedPassword);
        return [user, salt];
    }
}