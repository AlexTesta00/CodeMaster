import { User } from '../domain/user'
import { UserId } from '../domain/user-id'

export type UserIdentifier = UserId | string

export interface AuthenticationService {
  registerUser(nickname: UserId, email: string, password: string): Promise<User>
  loginUser(id: UserIdentifier, password: string): Promise<string>
  logoutUser(id: UserIdentifier): Promise<void>
  updateUserEmail(id: UserIdentifier, newEmail: string): Promise<void>
  updateUserPassword(
    id: UserIdentifier,
    oldPassword: string,
    newPassword: string
  ): Promise<void>
  deleteUser(nickname: UserIdentifier): Promise<void>
  refreshAccessUserToken(id: UserIdentifier): Promise<string>
}

export class AuthenticationServiceError {
  static UserAlreadyExist = class extends Error {}
  static InvalidPasswordFormat = class extends Error {}
  static InvalidCredential = class extends Error {}
  static InvalidRefreshToken = class extends Error {}
  static InvalidAccessToken = class extends Error {}
}
