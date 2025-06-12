import { Request, Response } from 'express'
import { deleteLevel, getAllLevels, registerNewLevel } from '../application/user-service'
import { isLeft } from 'fp-ts/Either'

export const addLevel = async (req: Request, res: Response): Promise<void> => {
  const { grade, title, xpLevel, url } = req.body
  const result = await registerNewLevel({ value: grade }, title, xpLevel, url)
  if (isLeft(result))
    res.status(404).json({ message: result.left.message, success: false })
  else
    res
      .status(200)
      .json({ message: 'Levels changed', success: true, level: result.right })
}

export const removeLevel = async (req: Request, res: Response): Promise<void> => {
  const { grade } = req.params
  const result = await deleteLevel({ value: parseInt(grade) })
  if (isLeft(result))
    res.status(404).json({ message: result.left.message, success: false })
  else
    res
      .status(200)
      .json({ message: 'Levels changed', success: true, level: result.right })
}

export const getLevels = async (req: Request, res: Response): Promise<void> => {
  const result = await getAllLevels()
  if (isLeft(result))
    res.status(404).json({ message: result.left.message, success: false })
  else
    res
      .status(200)
      .json({ message: 'Levels retrieved', success: true, level: result.right })
}
