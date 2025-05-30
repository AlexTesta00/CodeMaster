import * as languages from './languages.json'
import { LanguageModel } from './language-model'

export const populateLanguages = async () => {
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i]
    await new LanguageModel({
      name: language.name,
      version: language.version,
      fileExtension: language.fileExtension,
    }).save()
  }
}
