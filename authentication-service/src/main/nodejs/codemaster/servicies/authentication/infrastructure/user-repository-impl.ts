import { User } from "../domain/user";
import { UserRepository } from "./user-repository";
import { UserModel } from "../domain/user-model";
import { UserId } from "../domain/user-id";

export class UserRepositoryImpl implements UserRepository {
    async save(user: User): Promise<void> {
        const userDocument = new UserModel({
            nickname: user.id.value,
            email: user.email,
            password: user.password
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

    async updateUserPassword(nickname: string, newPassword: string): Promise<void> {
        await UserModel.findOneAndUpdate({ nickname: nickname }, { password: newPassword }).orFail();
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