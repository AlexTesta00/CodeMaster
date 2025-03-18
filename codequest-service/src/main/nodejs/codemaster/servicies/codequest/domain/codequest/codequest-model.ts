import mongoose, {Schema} from 'mongoose';
import { languageSchema } from '../language/language-model';

export const codequestSchema = new Schema({
    questId: {type:'string', required: true, unique: true, key: true},
    author: {type: 'string', required: true},
    problem: {type: 'string', required: true},
    timestamp: {type: Date, default: Date.now()},
    title: {type: 'string', required: true},
    languages:
        {
            type: [languageSchema],
            ref: 'Language'
        }
});

export const CodeQuestModel = mongoose.model('Codequest', codequestSchema);