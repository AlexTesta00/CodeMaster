import {User} from "../domain/User";

export interface UserRepository {
    create(user: User): Promise<User>;
    findUserByNickname(nickname: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
}