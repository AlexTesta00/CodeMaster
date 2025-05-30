export class Example {
  constructor(
    public input: string,
    public output: string,
    public explanation: string
  ) {}

  equals(other: Example) {
    return  this.input == other.input &&
            this.output == other.output &&
            this.explanation == other.explanation
  }
}
