import { Option } from 'fp-ts/Option'

export type ProfilePicture = Readonly<{
  url: string
  alt: Option<string>
}>
