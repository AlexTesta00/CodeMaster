import { Example } from './example'

export class Problem {
  constructor(
    public description: string,
    public examples: Example[],
    public constraints: string[]
  ) {}

  equals(other: Problem) {
    return  this.description == other.description &&
            this.examples.every((ex, index) => ex.equals(other.examples[index])) &&
            this.constraints == this.constraints
  }
}
