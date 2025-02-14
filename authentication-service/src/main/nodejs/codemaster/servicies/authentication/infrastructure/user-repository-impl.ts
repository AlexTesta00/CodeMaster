import bcrypt from 'bcrypt';
import { User } from "../domain/user";
import { UserRepository } from "./user-repository";
import { UserModel } from "../domain/user-model";
import { UserId } from "../domain/user-id";
import { Salt } from "../domain/user-salt";

export class UserRepositoryImpl implements UserRepository {
    async save(user: User): Promise<void> {
        try{

            const [hashedPassword, salt] = await this.#hashPassword(user.password);

            const userDocument = new UserModel({
                nickname: user.id.value,
                email: user.email,
                password: hashedPassword,
                salt: salt.value
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

    
    async updateUserEmail(nickname: string, newEmail: string): Promise<void> {
        const userDocument = await UserModel.findOne({ nickname }).exec();
        if(!userDocument) throw new Error('User not found');
        userDocument.email = newEmail;
        await userDocument.save();
    }

    async #hashPassword(password: string): Promise<[string, Salt]> {
        const saltRounds: number = 16;
        const salt: string = await bcrypt.genSalt(saltRounds);
        const hashedPassword: string = await bcrypt.hash(password, salt);
        return [hashedPassword, new Salt(salt)];
    }

    async updateUserPassword(nickname: string, newPassword: string): Promise<void> {
        const userDocument = await UserModel.findOne({ nickname }).exec();
        if(!userDocument) throw new Error('User not found');
        const [hashedPassword, salt] = await this.#hashPassword(newPassword);
        userDocument.password = hashedPassword;
        userDocument.salt = salt.value;
        await userDocument.save();
    }

    async deleteUser(nickname: string): Promise<void> {
        const userDocument = await UserModel.findOneAndDelete({ nickname }).exec();
        if(!userDocument) throw new Error('User not found');
    }

    async verifyUserCredentialsByNickname(nickname: string, password: string): Promise<boolean> {
        const userDocument = await UserModel.findOne({ nickname }).exec();
        if(!userDocument) throw new Error('User not found');
        return bcrypt.compare(password, userDocument.password);
    }

    async verifyUserCredentialsByEmail(email: string, password: string): Promise<boolean> {
        const userDocument = await UserModel.findOne({ email }).exec();
        if(!userDocument) throw new Error('User not found');
        return bcrypt.compare(password, userDocument.password);
    }

    
}