import { User } from '../domain/user'
import { UserManager } from '../domain/user-manager'

export interface UserDocument {
  nickname: string
  email: string
  password: string
  isAdmin: boolean
  isBanned: boolean
  refreshToken: string
}

export const toUserModel = (user: User): UserDocument => ({
  nickname: user.nickname.value,
  email: user.email,
  password: user.password,
  isAdmin: user.role.name === 'admin',
  isBanned: false,
  refreshToken: '',
})

export const toUserManager = (userDocument: UserDocument): UserManager => ({
  info: {
    nickname: { value: userDocument.nickname },
    email: userDocument.email,
    password: userDocument.password,
    role: userDocument.isAdmin ? { name: 'admin' } : { name: 'user' },
  },
  banned: userDocument.isBanned,
  refreshToken: userDocument.refreshToken,
})
