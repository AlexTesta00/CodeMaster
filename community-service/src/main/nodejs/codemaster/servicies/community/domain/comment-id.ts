import crypto from 'crypto'

export class CommentId {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static fromParts(author: string, questId: string, timestamp: Date): CommentId {
    const hash = crypto
      .createHash('sha256')
      .update(`${author}:${questId}:${timestamp.getTime()}`)
      .digest('hex')
    return new CommentId(hash)
  }

  static fromString(value: string): CommentId {
    return new CommentId(value)
  }

  toString(): string {
    return this.value
  }

  equals(other: CommentId): boolean {
    return this.value === other.value
  }
}
