import mongoose, {Schema} from 'mongoose';

const userSchema = new Schema({
    nickname: {type: 'string', required: true, unique: true, key: true},
    email: {type: 'string', required: true, unique: true},
    password: {type: 'string', required: true},
    salt: {type: 'string', required: true}
});

export const UserModel = mongoose.model('User', userSchema);