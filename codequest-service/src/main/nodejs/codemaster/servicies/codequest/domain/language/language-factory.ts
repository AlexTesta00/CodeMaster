import { Language } from './language'

export class LanguageFactory {
  static newLanguage(name: string, version: string, fileExtension: string): Language {
    if (!name || name == '') {
      throw new LanguageError.InvalidName('Invalid code language name')
    }

    if (!version || version == '') {
      throw new LanguageError.InvalidVersion('Invalid version of language')
    }

    return new Language(name, version, fileExtension)
  }
}

export class LanguageError {
  static InvalidName = class extends Error {}
  static InvalidVersion = class extends Error {}
}
