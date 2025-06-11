import type { Option } from 'fp-ts/Option'
import type { Link } from '../components/ContactsCard.vue'

export type Person = {
    name: string
    image: string
    role: string
    link: [Link]
}

export interface AuthenticationResponse {
    message: string
    success: boolean
    token?: string
    user?: {
        info: {
            nickname: string
            email: string
            password: string
            role: 'admin' | 'user'
        }
        banned: boolean
        refreshToken: string
    }
}

export interface UserId {
    value: string
}

export interface User {
    nickname: UserId
    bio: Option<string>
}

export interface ProfilePicture {
    url: string
    alt: Option<string>
}

export interface Language {
    name: string
}

export interface CV {
    url: string
}

export interface TrophyId {
    value: string
}

export interface Trophy {
    title: TrophyId
    description: string
    url: string
    xp: number
}

export interface LevelId {
    value: number
}

export interface Level {
    grade: LevelId
    title: string
    xpLevel: number
}

export interface UserManager {
    userInfo: User
    profilePicture: Option<ProfilePicture>
    languages: Option<Iterable<Language>>
    cv: Option<CV>
    trophies: Option<Iterable<Trophy>>
    level: Level
}

export interface UserManagerResponse {
    message: string
    success: boolean
    user: UserManager
}
