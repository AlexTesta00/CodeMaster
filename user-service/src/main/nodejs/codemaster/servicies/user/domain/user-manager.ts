import { User } from './user'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { Level } from './level'

export type UserManager = Readonly<{
  userInfo: User
  profilePicture: ProfilePicture | null
  languages: Iterable<Language> | null
  cv: CV | null
  trophies: Iterable<Trophy> | null
  level: Level
}>
