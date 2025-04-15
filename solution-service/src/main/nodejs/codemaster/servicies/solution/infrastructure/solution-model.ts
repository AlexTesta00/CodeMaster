import mongoose, { Schema } from 'mongoose'

const LanguageSchema = new Schema({
  name: { type: 'string', required: true },
  version: { type: 'string', required: true }
})

const SolutionSchema = new Schema({
  content: { type: 'string', required: true },
  codequest: { type: 'string', required: true },
  author: { type: 'string', required: true },
  language: { type: LanguageSchema, required: true },
  fileEncoding: { type: 'string', required: true },
  result: { type: Schema.Types.Mixed, required: false }
})

export const SolutionModel = mongoose.model('Solution', SolutionSchema)