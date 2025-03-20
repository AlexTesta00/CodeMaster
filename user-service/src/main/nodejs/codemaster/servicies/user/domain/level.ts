export class LevelId {
  constructor(public readonly value: number) {
    if (!value || value == 0) throw new Error('LevlId cannot be empty or equal to zero')
  }
}

export class Level {
  constructor(
    public readonly grade: LevelId,
    public readonly title: string,
    public readonly xpLevel: number
  ) {}
}
