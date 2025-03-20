export class LevelId {
  constructor(public readonly value: number) {
    if (!value) throw new Error('UserId cannot be empty')
  }
}

export class Level {
  constructor(
    public readonly grade: LevelId,
    public readonly title: string,
    public readonly value: number
  ) {}
}
