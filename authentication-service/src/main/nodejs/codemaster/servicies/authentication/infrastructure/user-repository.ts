import {User} from "../domain/user";

export interface UserRepository {
    save(user: User): Promise<void>;
    findUserByNickname(nickname: string): Promise<User>;
    findUserByEmail(email: string): Promise<User>;
    updateUserEmail(nickname: string, newEmail: string): Promise<void>;
    updateUserPassword(nickname: string, newPassword: string): Promise<void>;
    deleteUser(nickname: string): Promise<void>;
    verifyUserCredentialsByNickname(nickname: string, password: string): Promise<boolean>;
    verifyUserCredentialsByEmail(email: string, password: string): Promise<boolean>;
}