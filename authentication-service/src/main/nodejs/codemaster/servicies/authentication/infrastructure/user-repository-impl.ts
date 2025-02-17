import bcrypt from 'bcrypt';
import { User } from "../domain/user";
import { UserRepository } from "./user-repository";
import { UserModel } from "../domain/user-model";
import { UserId } from "../domain/user-id";

export class UserRepositoryImpl implements UserRepository {
    async save(user: User): Promise<void> {
        const [hashedPassword, salt] = await this.#hashPassword(user.password);
        const userDocument = new UserModel({
            nickname: user.id.value,
            email: user.email,
            password: hashedPassword,
            salt: salt
        });
        await userDocument.save().catch((error) => { throw error; });
    }

    async findUserByNickname(nickname: string): Promise<User> {
        const userDocument = await UserModel.findOne({ nickname }).orFail();
        return new User(new UserId(userDocument.nickname), userDocument.email, userDocument.password);
    }

    async findUserByEmail(email: string): Promise<User> {
        const userDocument = await UserModel.findOne({ email }).orFail();
        return new User(new UserId(userDocument.nickname), userDocument.email, userDocument.password);
    }

    
    async updateUserEmail(nickname: string, newEmail: string): Promise<void> {
        await UserModel.findOneAndUpdate({nickname: nickname }, {email: newEmail}).orFail();
    }

    async #hashPassword(password: string): Promise<[string, string]> {
        const saltRounds: number = 16;
        const salt: string = await bcrypt.genSalt(saltRounds);
        const hashedPassword: string = await bcrypt.hash(password, salt);
        return [hashedPassword, salt];
    }

    async updateUserPassword(nickname: string, newPassword: string): Promise<void> {
        const [hashedPassword, salt] = await this.#hashPassword(newPassword);
        await UserModel.findOneAndUpdate({ nickname: nickname }, { password: hashedPassword}, { salt: salt}).orFail();
    }

    async updateUserRefreshToken(nickname: string, refreshToken: string): Promise<void> {
        await UserModel.findOneAndUpdate({nickname: nickname }, { refreshToken: refreshToken }).orFail();
    }

    async deleteUser(nickname: string): Promise<void> {
        await UserModel.findOneAndDelete({ nickname }).orFail();
    }

    async getUserRefreshToken(nickname: string): Promise<string> {
        return (await (UserModel.findOne({ nickname }).orFail())).refreshToken;
    }
    
}