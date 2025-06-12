import { CommentId } from './comment-id'
import { Comment } from './comment'

export class CommentFactory {
  static newComment(
    content: string,
    questId: string,
    author: string,
    timeStamp = new Date(Date.now()),
    id = CommentId.fromParts(author, questId, timeStamp)
  ): Comment {
    if (author == '') {
      throw new CommentError.InvalidAuthor('Author cannot be empty')
    }

    if (questId == '') {
      throw new CommentError.InvalidQuestId('QuestId cannot be empty')
    }

    if (content == '') {
      throw new CommentError.InvalidContent('Cannot post and empty comment')
    }

    return new Comment(id, content, questId, author, timeStamp)
  }
}

export class CommentError {
  static InvalidAuthor = class extends Error {}
  static InvalidQuestId = class extends Error {}
  static InvalidContent = class extends Error {}
}
