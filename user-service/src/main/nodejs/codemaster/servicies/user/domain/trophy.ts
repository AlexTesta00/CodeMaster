export class TrophyId {
  constructor(public readonly value: string) {
    if (!value || value === '') throw new Error('TrophyId cannot be empty')
  }
}

export class Trophy {
  constructor(
    public readonly title: TrophyId,
    public readonly description: string,
    public readonly url: string,
    public readonly xp: number
  ) {}
}
