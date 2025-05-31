import mongoose, { Schema, Document, HydratedDocument } from 'mongoose'
import { languageSchema } from '../language/language-model'

const DifficultySchema = new Schema({
  name: { type: String, required: true },
})

const ExampleSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String },
})

const ProblemSchema = new Schema({
  description: { type: String, required: true },
  examples: { type: [ExampleSchema], required: true },
  constraints: { type: [String], required: true },
})

export const CodequestSchema = new Schema({
  questId: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  problem: { type: ProblemSchema, required: true },
  timestamp: { type: Date, default: Date.now },
  title: { type: String, required: true },
  languages: { type: [languageSchema], required: true },
  difficulty: { type: DifficultySchema, required: true },
})

export interface CodeQuestDocument extends Document {
  questId: string
  author: string
  title: string
  problem: {
    description: string
    examples: {
      input: string
      output: string
      explanation?: string
    }[]
    constraints: string[]
  }
  timestamp: Date
  languages: {
    name: string
    version: string
    fileExtension: string
  }[]
  difficulty: {
    name: string
  }
}

export type CodeQuestDoc = HydratedDocument<CodeQuestDocument>

export const CodeQuestModel = mongoose.model<CodeQuestDocument>(
  'Codequest',
  CodequestSchema
)
