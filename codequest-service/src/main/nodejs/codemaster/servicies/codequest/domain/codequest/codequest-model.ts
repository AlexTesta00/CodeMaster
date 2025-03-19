import mongoose, {Schema} from 'mongoose';
import { languageSchema } from '../language/language-model';

const ExampleSchema = new Schema({
    input: {type: 'string', required: true},
    output: {type: 'string', required: true},
    explanation: { type: 'string', required: false}
})

const ProblemSchema = new Schema({
    body: {type: 'string', required: true},
    examples: { type: [ExampleSchema], required: true },
    constraints: ['string']
})

export const CodequestSchema = new Schema({
    questId: {type:'string', required: true, unique: true, key: true},
    author: {type: 'string', required: true},
    problem: {type: ProblemSchema, required: true},
    timestamp: {type: Date, default: Date.now()},
    title: {type: 'string', required: true},
    languages:
        {
            type: [languageSchema],
            ref: 'Language'
        }
});

export const CodeQuestModel = mongoose.model('Codequest', CodequestSchema);