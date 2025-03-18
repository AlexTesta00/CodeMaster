import { User } from './user'
import { ProfilePicture } from './profile-picture'
import { Language } from './language'
import { CV } from './cv'
import { Trophy } from './trophy'
import { Level } from './level'

export class UserManager {
  constructor(
    private userInfo: User,
    private profilePicture: ProfilePicture,
    private languages: Set<Language>,
    private cv: CV,
    private trophies: Set<Trophy>,
    private level: Level
  ) {}
}
