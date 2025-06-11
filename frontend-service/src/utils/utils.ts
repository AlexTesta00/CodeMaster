import { isSome, type Option } from 'fp-ts/Option'

const unwrap = <T>(option: Option<T>): T | null => isSome(option) ? option.value : null