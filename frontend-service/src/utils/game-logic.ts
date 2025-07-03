import type { Trophy } from './interface.ts'
import axios from 'axios'
import { errorToast, sweetModalWithImage } from './notify.ts'

const USER_TROPHY_URL = 'http://localhost/api/v1/users/'
const TROPHY_URL = 'http://localhost/api/v1/trophies/'

const findTrophyByTitle = async (title: string): Promise<Trophy | null> => {
  try {
    const { data } = await axios.get(TROPHY_URL)
    if(!data.success){
      await errorToast('Impossible to load trophies')
      return null
    }

    const trophy = data.trophies.find((t: Trophy) => t.title.value === title)

    if(!trophy){
      await errorToast('Trophy not exist')
      return null
    }

    return trophy
  }catch (error) {
    await errorToast('Something went wrong while loading trophies')
    return null
  }
}

const assignTrophy = async (
  nickname: string,
  trophy: Trophy
): Promise<boolean> => {
  try {
    const { data } = await axios.put(
      `${USER_TROPHY_URL}trophies`,
      {
        nickname,
        newTrophies: [trophy],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!data.success) {
      await errorToast('Impossible to assign trophy to user')
      return false
    }

    await sweetModalWithImage(`Congratulations you have obtained: ${trophy.title.value} trophy`, trophy.description, trophy.url, 'Image of trophy obtained')
    return true
  } catch (error) {
    await errorToast('Something went wrong while assigning trophy')
    return false
  }
}

export const assignTrophyByTitle = async (
  nickname: string,
  trophyTitle: string
): Promise<void> => {
  const trophy = await findTrophyByTitle(trophyTitle)
  if (!trophy) return
  await assignTrophy(nickname, trophy)
}