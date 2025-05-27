import mongoose, { Schema } from "mongoose"

export const CommentSchema = new Schema({
  id: { type: 'string', required: true, unique: true, key: true },
  questId: { type: 'string', required: true, unique: true, key: true },
  author: { type: 'string', required: true },
  timestamp: { type: Date }
})

export const CodeQuestModel = mongoose.model('Comment', CommentSchema)
