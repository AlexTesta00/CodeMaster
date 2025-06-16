import { errorHandler } from '../../interfaces/error-handler'
import { app } from '../../app'
import { Express } from 'express'
import { ConsumerImpl } from '../middleware/consumer-impl'
import { Consumer } from '../middleware/consumer'
import { CommunityServiceImpl } from '../../application/community-service-impl'
import CommunityController from '../../interfaces/community-controller'
import { createCommunityRouter } from '../../interfaces/community-routes'

export async function createServer(deps?: { consumer?: Consumer }): Promise<Express> {
  const service = new CommunityServiceImpl()
  const controller = new CommunityController(service)

  const consumer = deps?.consumer ?? new ConsumerImpl(service)

  const router = createCommunityRouter(controller)
  app.use('/api/v1/comments', router)
  app.use(errorHandler)

  await consumer.start()
  return app
}
