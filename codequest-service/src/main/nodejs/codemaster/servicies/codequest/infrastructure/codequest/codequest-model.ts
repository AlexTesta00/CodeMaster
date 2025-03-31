import mongoose, {Schema} from 'mongoose';
import { languageSchema } from '../language/language-model';

const ExampleSchema = new Schema({
    input: {type: String, required: true},
    output: {type: String, required: true},
    explanation: {type: String}
})

const ProblemSchema = new Schema({
    body: {type: String, required: true},
    examples: { type: [ExampleSchema], required: true },
    constraints: [String]
})

export const CodequestSchema = new Schema({
    questId: {type: String, required: true, unique: true, key: true},
    author: {type: String, required: true},
    problem: {type: ProblemSchema, required: true},
    timestamp: {type: Date, default: Date.now()},
    title: {type: String, required: true},
    languages: [languageSchema]
});

export const CodeQuestModel = mongoose.model('Codequest', CodequestSchema);