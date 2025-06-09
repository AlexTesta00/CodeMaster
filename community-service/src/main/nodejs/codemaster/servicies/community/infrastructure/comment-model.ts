import mongoose, { Schema } from "mongoose"

export const CommentSchema = new Schema({
  id: { type: 'string', required: true, unique: true, key: true },
  questId: { type: 'string', required: true },
  author: { type: 'string', required: true },
  content: { type: 'string', required: true },
  timestamp: { type: Date, required: true }
})

export const CommentModel = mongoose.model('Comment', CommentSchema)
