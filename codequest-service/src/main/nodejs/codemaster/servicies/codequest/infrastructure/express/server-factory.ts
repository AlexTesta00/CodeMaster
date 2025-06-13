import { CodeQuestServiceImpl } from '../../application/codequest-service-impl'
import { PublisherImpl } from '../middleware/publisher-impl'
import { createCodeQuestRouter } from '../../interfaces/codequest-routes'
import Controller from '../../interfaces/codequest-controller'
import { errorHandler } from '../../interfaces/error-handler'
import { app } from '../../app'
import { Express } from 'express'
import { Consumer } from '../middleware/consumer'
import { Publisher } from '../middleware/publisher'
import { ConsumerImpl } from '../middleware/consumer-impl'

export async function createServer(
  deps?: {
    publisher?: Publisher
    consumer?: Consumer
  }
): Promise<Express> {
  const publisher = deps?.publisher ?? new PublisherImpl()

  const codeQuestService = new CodeQuestServiceImpl(publisher)
  await codeQuestService.populateLanguages()

  const controller = new Controller(codeQuestService)

  const consumer = deps?.consumer ?? new ConsumerImpl(codeQuestService)

  const codeQuestRouter = createCodeQuestRouter(controller)
  app.use('/api/v1/codequests', codeQuestRouter)
  app.use(errorHandler)

  await consumer.start()
  await publisher.connect()
  return app
}
