export class Difficulty {
  private constructor(public readonly name: string) {}

  static readonly Easy = new Difficulty("Easy");
  static readonly Medium = new Difficulty("Medium");
  static readonly Hard = new Difficulty("Hard");

  static from(value: string): Difficulty {
    switch (value.toLowerCase()) {
      case "easy": return Difficulty.Easy;
      case "medium": return Difficulty.Medium;
      case "hard": return Difficulty.Hard;
      default:
        throw new Error(`Invalid difficulty: ${value}`);
    }
  }

  equals(other: Difficulty): boolean {
    return this.name === other.name;
  }
}
