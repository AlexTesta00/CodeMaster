import { User } from './user'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { Level } from './level'

export class UserManager {
  constructor(
    public readonly userInfo: User,
    public readonly profilePicture: ProfilePicture | null,
    public readonly languages: Iterable<Language> | null,
    public readonly cv: CV | null,
    public readonly trophies: Iterable<Trophy> | null,
    public readonly level: Level
  ) {}
}
