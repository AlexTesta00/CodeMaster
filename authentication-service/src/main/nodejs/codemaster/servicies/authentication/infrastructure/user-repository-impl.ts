import bcrypt from 'bcrypt';
import { User } from "../domain/user";
import { UserRepository } from "./user-repository";
import { UserModel } from "../domain/user-model";
import { UserId } from "../domain/user-id";
import { Salt } from "../domain/user-salt";

export class UserRepositoryImpl implements UserRepository {

    async save(user: User): Promise<void> {
        try{

            const saltRounds: number = 16;
            const salt: string = await bcrypt.genSalt(saltRounds);
            const hashedPassword: string = await bcrypt.hash(user.password, salt);

            const userDocument = new UserModel({
                nickname: user.id.value,
                email: user.email,
                password: hashedPassword,
                salt: salt
            });

            await userDocument.save();
        } catch(err) {
            throw new Error('Error saving user to database: ' + err);
        }   
    }

    async findUserByNickname(nickname: string): Promise<[User, Salt] | null> {
        const userDocument = await UserModel.findOne({ nickname }).exec();
        if(!userDocument) return null;
        return [new User(new UserId(userDocument.nickname), userDocument.email, userDocument.password), new Salt(userDocument.salt)];
    }

    async findUserByEmail(email: string): Promise<[User, Salt] | null> {
        const userDocument = await UserModel.findOne({ email }).exec();
        if(!userDocument) return null;
        return [new User(new UserId(userDocument.nickname), userDocument.email, userDocument.password), new Salt(userDocument.salt)];
    }
    
}