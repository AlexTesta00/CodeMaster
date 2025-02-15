import mongoose, {Schema} from 'mongoose';

const codequestSchema = new Schema({
    "id": {type:'string', required: true, unique: true, key: true},
    "author": {type: 'string', required: true, unique: true, key: true},
    "problem": {type: 'string', required: true},
    "timestamp": {type: Date, required: true, unique: true},
    "title": {type: 'string', required: true}
});

export const CodeQuestModel = mongoose.model('Codequest', codequestSchema);