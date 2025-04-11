import { Request, Response } from 'express'
import {
  deleteTrophy,
  getAllTrophies,
  registerNewTrophy,
} from '../application/user-service'
import { isLeft } from 'fp-ts/Either'

export const addTrophy = async (req: Request, res: Response): Promise<void> => {
  const { title, description, url, xp } = req.body
  const result = await registerNewTrophy({ value: title }, description, url, xp)
  if (isLeft(result))
    res.status(400).json({ message: result.left.message, success: false })
  else
    res
      .status(200)
      .json({ message: 'Trophies changed', success: true, trophy: result.right })
}

export const removeTrophy = async (req: Request, res: Response): Promise<void> => {
  const { trophyId } = req.params
  const result = await deleteTrophy({ value: trophyId })
  if (isLeft(result))
    res.status(404).json({ message: result.left.message, success: false })
  else res.status(200).json({ message: 'Trophies changed', success: true })
}

export const getTrophies = async (req: Request, res: Response): Promise<void> => {
  const result = await getAllTrophies()
  if (isLeft(result))
    res.status(400).json({ message: result.left.message, success: false })
  else
    res
      .status(200)
      .json({ message: 'Trophies retrieved', success: true, trophies: result.right })
}
