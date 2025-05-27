import { CommentError, CommentFactory } from '../../main/nodejs/codemaster/servicies/community/domain/comment-factory'
import { CommentId } from '../../main/nodejs/codemaster/servicies/community/domain/comment-id'

describe("CommentFactoryTest", () => {
  const timeout = 10000
  const author = "test-author"
  const questId = "test-id"
  const content = "test-content"

  it('should create new comment correctly', () => {
    const newComment = CommentFactory.newComment(content, questId, author)
    const id = new CommentId(author, questId, newComment.timestamp)

    expect(newComment.id).toStrictEqual(id)
    expect(newComment.questId).toBe(questId)
    expect(newComment.author).toBe(author)
    expect(newComment.content).toBe(content)
  }, timeout)

  it('should throw error if questId is invalid', () => {
    const invalidQuestId = ""
    expect( () =>
      CommentFactory.newComment(content, invalidQuestId, author)
    ).toThrow(CommentError.InvalidQuestId)
  }, timeout)

  it('should throw error if author name is invalid', () => {
    const invalidAuthor = ""

    expect( () =>
      CommentFactory.newComment(content, questId, invalidAuthor)
    ).toThrow(CommentError.InvalidAuthor)
  }, timeout)

  it('should throw error if author name is invalid', () => {
    const invalidContent = ""

    expect( () =>
      CommentFactory.newComment(invalidContent, questId, author)
    ).toThrow(CommentError.InvalidContent)
  }, timeout)
})