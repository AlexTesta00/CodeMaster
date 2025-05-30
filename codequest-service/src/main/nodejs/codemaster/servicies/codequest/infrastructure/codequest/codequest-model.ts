import mongoose, { Schema } from 'mongoose'
import { languageSchema } from '../language/language-model'

const DifficultySchema = new Schema({
  name: { type: 'string', required: true }
})

const ExampleSchema = new Schema({
  input: { type: 'string', required: true },
  output: { type: 'string', required: true },
  explanation: { type: 'string' },
})

const ProblemSchema = new Schema({
  description: { type: 'string', required: true },
  examples: { type: [ExampleSchema], required: true },
  constraints: ['string'],
})

export const CodequestSchema = new Schema({
  questId: { type: 'string', required: true, unique: true, key: true },
  author: { type: 'string', required: true },
  problem: { type: ProblemSchema, required: true },
  timestamp: { type: Date, default: Date.now() },
  title: { type: 'string', required: true },
  languages: { type: [languageSchema], required: true },
  difficulty: {type: DifficultySchema, required: true }
})

export const CodeQuestModel = mongoose.model('Codequest', CodequestSchema)
