export class UserId {
  constructor(public readonly value: string) {
    if (!value) throw new Error('UserId cannot be empty')
  }
  toString() {
    return this.value
  }
}

export class User {
  constructor(
    public readonly nickname: UserId,
    public readonly bio: string
  ) {}
}
