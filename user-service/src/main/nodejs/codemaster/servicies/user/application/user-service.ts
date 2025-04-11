import { UserId } from '../domain/user'
import { Either, isLeft, left, right } from 'fp-ts/Either'
import { UserManager } from '../domain/user-manager'
import { createAdvancedUserOption, createDefaultUserInfo } from '../domain/user-factory'
import {
  findUser,
  saveDefaultUser,
  updateUserInfo,
  deleteUser as deleteUserFromRepo,
} from '../infrastructure/user-repository'
import { isNone, isSome, none, some } from 'fp-ts/Option'
import { ProfilePicture } from '../domain/profile-picture'
import { CV } from '../domain/cv'
import { Language } from '../domain/language'
import { Trophy, TrophyId } from '../domain/trophy'
import { isEmpty } from 'fp-ts/string'
import { createTrophy } from '../domain/trophy-factory'
import { saveTrophy } from '../infrastructure/trophy-repository'
import { Level, LevelId } from '../domain/level'
import { createLevel } from '../domain/level-factory'
import {
  saveLevel,
  deleteLevel as deleteLevelFromRepo,
  getAllLevels as getAllLevelsFromRepo,
} from '../infrastructure/level-repository'
import {
  deleteTrophy as deleteTrophyFromRepo,
  getAllTrophies as getAllTrophiesFromRepo,
} from '../infrastructure/trophy-repository'

export const registerNewUser = async (
  nickname: UserId
): Promise<Either<Error, UserManager>> => {
  const newUserInfo = createDefaultUserInfo(nickname.value)
  if (isLeft(newUserInfo)) return left(newUserInfo.left)
  return await saveDefaultUser(newUserInfo.right)
}

export const getAllUserInfo = async (
  nickname: UserId
): Promise<Either<Error, UserManager>> => await findUser(nickname)

export const changeUserBio = async (
  nickname: UserId,
  newBio: string
): Promise<Either<Error, UserManager>> => {
  const foundUser = await getAllUserInfo(nickname)
  if (isLeft(foundUser)) return left(foundUser.left)
  const newUser = createAdvancedUserOption(
    foundUser.right.userInfo.nickname.value,
    isEmpty(newBio) ? none : some(newBio),
    foundUser.right.profilePicture,
    foundUser.right.languages,
    foundUser.right.cv,
    foundUser.right.trophies,
    foundUser.right.level
  )
  if (isLeft(newUser)) return left(newUser.left)
  return await updateUserInfo(nickname, newUser.right)
}

export const changeUserProfilePicture = async (
  nickname: UserId,
  newProfilePicture: ProfilePicture
): Promise<Either<Error, UserManager>> => {
  const foundUser = await getAllUserInfo(nickname)
  if (isLeft(foundUser)) return left(foundUser.left)
  const newUser = createAdvancedUserOption(
    foundUser.right.userInfo.nickname.value,
    foundUser.right.userInfo.bio,
    isEmpty(newProfilePicture.url) ? none : some(newProfilePicture),
    foundUser.right.languages,
    foundUser.right.cv,
    foundUser.right.trophies,
    foundUser.right.level
  )
  if (isLeft(newUser)) return left(newUser.left)
  return await updateUserInfo(nickname, newUser.right)
}

export const changeUserCV = async (
  nickname: UserId,
  newCV: CV
): Promise<Either<Error, UserManager>> => {
  const foundUser = await getAllUserInfo(nickname)
  if (isLeft(foundUser)) return left(foundUser.left)
  const rightFoundUser = foundUser.right
  const newUser = createAdvancedUserOption(
    rightFoundUser.userInfo.nickname.value,
    rightFoundUser.userInfo.bio,
    rightFoundUser.profilePicture,
    rightFoundUser.languages,
    isEmpty(newCV.url) ? none : some(newCV),
    rightFoundUser.trophies,
    rightFoundUser.level
  )
  if (isLeft(newUser)) return left(newUser.left)
  return await updateUserInfo(nickname, newUser.right)
}

export const changeUserLanguages = async (
  nickname: UserId,
  newLanguages: Iterable<Language>
): Promise<Either<Error, UserManager>> => {
  const foundUser = await getAllUserInfo(nickname)
  if (isLeft(foundUser)) return left(foundUser.left)
  const rightFoundUser = foundUser.right
  const newUser = createAdvancedUserOption(
    rightFoundUser.userInfo.nickname.value,
    rightFoundUser.userInfo.bio,
    rightFoundUser.profilePicture,
    Array.from(newLanguages).length > 0 ? some(newLanguages) : none,
    rightFoundUser.cv,
    rightFoundUser.trophies,
    rightFoundUser.level
  )
  if (isLeft(newUser)) return left(newUser.left)
  return await updateUserInfo(nickname, newUser.right)
}

export const changeUserTrophy = async (
  nickname: UserId,
  trophies: Iterable<Trophy>
): Promise<Either<Error, UserManager>> => {
  const foundUser = await getAllUserInfo(nickname)
  if (isLeft(foundUser)) return left(foundUser.left)
  const rightFoundUser = foundUser.right
  const oldTrophies = isSome(rightFoundUser.trophies)
    ? Array.from(rightFoundUser.trophies.value)
    : []
  const allTrophies = Array.from(trophies).concat(oldTrophies)
  const newUser = createAdvancedUserOption(
    rightFoundUser.userInfo.nickname.value,
    rightFoundUser.userInfo.bio,
    rightFoundUser.profilePicture,
    rightFoundUser.languages,
    rightFoundUser.cv,
    Array.from(allTrophies).length > 0 ? some(allTrophies) : none,
    rightFoundUser.level
  )
  if (isLeft(newUser)) return left(newUser.left)
  return await updateUserInfo(nickname, newUser.right)
}

//TODO: Test it
export const deleteUser = async (nickname: UserId): Promise<Either<Error, void>> =>
  await deleteUserFromRepo(nickname)

export const registerNewTrophy = async (
  title: TrophyId,
  description: string,
  url: string,
  xp: number
): Promise<Either<Error, Trophy>> => {
  const newTrophy = createTrophy(title.value, description, url, xp)
  if (isLeft(newTrophy)) return left(newTrophy.left)
  return await saveTrophy(newTrophy.right)
}

export const deleteTrophy = async (id: TrophyId): Promise<Either<Error, void>> =>
  await deleteTrophyFromRepo(id)

export const getAllTrophies = async (): Promise<Either<Error, Iterable<Trophy>>> =>
  await getAllTrophiesFromRepo()

export const registerNewLevel = async (
  grade: LevelId,
  title: string,
  xpLevel: number
): Promise<Either<Error, Level>> => {
  const newLevel = createLevel(grade.value, title, xpLevel)
  if (isLeft(newLevel)) return left(newLevel.left)
  return await saveLevel(newLevel.right)
}

export const deleteLevel = async (grade: LevelId): Promise<Either<Error, void>> =>
  await deleteLevelFromRepo(grade)

export const getAllLevels = async (): Promise<Either<Error, Iterable<Level>>> =>
  await getAllLevelsFromRepo()

export const computeUserLevel = async (
  nickname: UserId
): Promise<Either<Error, Level>> => {
  const foundUser = await findUser(nickname)
  if (isLeft(foundUser)) return left(foundUser.left)
  const userTrophies = foundUser.right.trophies
  if (isNone(userTrophies)) return left(new Error('User trophy none'))
  const totalXp = Array.from(userTrophies.value)
    .map((trophy) => trophy.xp)
    .reduce((accumulator, current) => accumulator + current, 0)
  const levels = await getAllLevels()
  if (isLeft(levels)) return left(new Error('Levels error: cannot find all levels'))
  const xpLevel = Array.from(levels.right)
    .map((levels) => levels.xpLevel)
    .filter((xpLevel) => xpLevel <= totalXp)
    .reduce((max, current) => (current > max ? current : max), 0)
  return right(Array.from(levels.right).find((level) => level.xpLevel === xpLevel)!)
}
