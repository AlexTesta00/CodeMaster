import { User } from './user'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { Level } from './level'
import { Option } from 'fp-ts/Option'

export type UserManager = Readonly<{
  userInfo: User
  profilePicture: Option<ProfilePicture>
  languages: Option<Iterable<Language>>
  cv: Option<CV>
  trophies: Option<Iterable<Trophy>>
  level: Level
}>
