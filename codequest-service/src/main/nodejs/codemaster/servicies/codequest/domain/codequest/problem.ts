import { Example } from './example'

export class Problem {
  constructor(
    public body: string,
    public examples: Example[],
    public constraints: string[] | null
  ) {}
}
