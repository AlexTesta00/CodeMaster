import { UserId } from './user-id'

export class User {
  constructor(
    public readonly nickname: UserId,
    public readonly bio: string
  ) {}
}
