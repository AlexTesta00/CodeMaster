import {User} from "../domain/user";

export interface UserRepository {
    save(user: User): Promise<User>;
    findUserByNickname(nickname: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
}