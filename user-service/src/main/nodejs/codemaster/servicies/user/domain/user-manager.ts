import { User } from './user'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { Level } from './level'

export class UserManager {
  constructor(
    public readonly userInfo: User,
    public readonly profilePicture: ProfilePicture,
    public readonly languages: Iterable<Language>,
    public readonly cv: CV,
    public readonly trophies: Iterable<Trophy>,
    public readonly level: Level
  ) {}
}
