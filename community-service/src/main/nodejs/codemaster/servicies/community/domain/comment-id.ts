import crypto from 'crypto'

export class CommentId {
  private readonly value: string

  constructor(author: string, questId: string, timestamp: Date) {
    this.value = crypto
      .createHash('sha256')
      .update(`${author}:${questId}:${timestamp.getDate()}`)
      .digest('hex')
  }

  toString(): string {
    return this.value
  }

  equals(other: CommentId): boolean {
    return this.value === other.value
  }
}
