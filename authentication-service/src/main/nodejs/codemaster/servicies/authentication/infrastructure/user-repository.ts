import {User} from "../domain/user";
import { Salt } from "../domain/user-salt";

export interface UserRepository {
    save(user: User): Promise<void>;
    findUserByNickname(nickname: string): Promise<[User, Salt] | null>;
    findUserByEmail(email: string): Promise<[User, Salt] | null>;
    updateUserEmail(nickname: string, newEmail: string): Promise<void>;
    updateUserPassword(nickname: string, newPassword: string): Promise<void>;
    deleteUser(nickname: string): Promise<void>;
}