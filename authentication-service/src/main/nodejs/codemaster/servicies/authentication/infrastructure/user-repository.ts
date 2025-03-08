import { User } from '../domain/user'
import { UserId } from '../domain/user-id'

export interface UserRepository {
  save(user: User): Promise<void>
  findUserByNickname(nickname: UserId): Promise<User>
  findUserByEmail(email: string): Promise<User>
  updateUserEmail(nickname: UserId, newEmail: string): Promise<void>
  updateUserPassword(nickname: UserId, newPassword: string): Promise<void>
  updateUserRefreshToken(nickname: UserId, refreshToken: string): Promise<void>
  deleteUser(nickname: UserId): Promise<void>
  getUserRefreshToken(nickname: UserId): Promise<string>
}
