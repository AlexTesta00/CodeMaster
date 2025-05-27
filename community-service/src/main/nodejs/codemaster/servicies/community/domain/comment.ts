import { CommentId } from './comment-id'

export class Comment {
  constructor(
    public readonly id: CommentId,
    public content: string,
    public questId: string,
    public author: string,
    public timestamp: Date
  ) {}
}