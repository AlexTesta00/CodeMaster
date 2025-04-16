import * as mongoose from 'mongoose'
import { Language } from './language'

export class Solution {
  constructor(readonly id: mongoose.Types.ObjectId,
              readonly code: string,
              readonly codequest: mongoose.Types.ObjectId,
              readonly author: string,
              readonly language: Language,
              readonly fileEncoding: string,
              readonly result: any) {}
}