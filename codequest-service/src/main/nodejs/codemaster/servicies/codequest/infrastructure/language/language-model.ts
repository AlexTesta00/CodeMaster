import mongoose, { Schema } from 'mongoose'

export const languageSchema = new Schema({
  name: { type: 'string', required: true },
  version: { type: 'string', required: true },
  fileExtension: { type: 'string', required: true },
})

export const LanguageModel = mongoose.model('Language', languageSchema)
