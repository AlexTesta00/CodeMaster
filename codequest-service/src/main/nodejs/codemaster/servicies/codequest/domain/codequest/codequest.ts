import { Language } from '../language/language'
import { Problem } from './problem'
import { Difficulty } from './difficulty'

export class CodeQuest {
  constructor(
    public readonly id: string,
    public title: string,
    public author: string,
    public problem: Problem,
    public timestamp: Date | null,
    public languages: Language[],
    public difficulty: Difficulty
  ) {}
}
