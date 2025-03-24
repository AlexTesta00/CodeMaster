import mongoose, { Schema } from 'mongoose'

const userInfoSchema = new Schema({
  nickname: { type: 'string', required: true, unique: true, key: true },
  bio: { type: 'string', default: '' },
})

const profilePictureSchema = new Schema({
  url: { type: 'string', default: '' },
  alt: { type: 'string', default: '' },
})

const languageSchema = new Schema({
  name: { type: 'string', required: true },
})

const cvSchema = new Schema({
  url: { type: 'string', default: '' },
})

const trophySchema = new Schema({
  title: { type: 'string', required: true, unique: true, key: true },
  description: { type: 'string', required: true },
  url: { type: 'string', required: true },
  xp: { type: 'number', required: true },
})

const levelSchema = new Schema({
  grade: { type: 'number', required: true, unique: true, key: true },
  title: { type: 'string', required: true },
  xp: { type: 'number', required: true },
})

const userManagerSchema = new Schema({
  userInfo: { type: userInfoSchema, required: true },
  profilePicture: {
    type: profilePictureSchema,
    required: true,
    default: { url: '', alt: '' },
  },
  languages: { type: [languageSchema], required: true, default: [] },
  cv: { type: cvSchema, required: true, default: { url: '' } },
  trophies: { type: [trophySchema], required: true, default: [] },
  level: {
    type: levelSchema,
    required: true,
    default: { grade: 'novice', title: 1, xp: 1 },
  },
})

export const UserManagerModel = mongoose.model('UserManager', userManagerSchema)
