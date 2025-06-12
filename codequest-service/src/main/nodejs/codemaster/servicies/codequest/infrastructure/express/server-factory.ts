import { CodeQuestServiceImpl } from '../../application/codequest-service-impl'
import { RabbitMqEventPublisher } from '../middleware/publisher'
import { createCodeQuestRouter } from '../../interfaces/codequest-routes'
import Controller from '../../interfaces/codequest-controller'
import { errorHandler } from '../../interfaces/error-handler'
import { app } from '../../app'
import { Express } from 'express'
import { RabbitMqEventConsumer } from '../middleware/consumer'

export async function createServer(): Promise<{ app: Express; consumer: RabbitMqEventConsumer, publisher: RabbitMqEventPublisher }> {
  const publisher = new RabbitMqEventPublisher()
  await publisher.connect()

  const codeQuestService = new CodeQuestServiceImpl(publisher)
  await codeQuestService.populateLanguages()

  const controller = new Controller(codeQuestService)

  const consumer = new RabbitMqEventConsumer(codeQuestService)
  await consumer.start()

  const codeQuestRouter = createCodeQuestRouter(controller)
  app.use('/api/v1/codequests', codeQuestRouter)
  app.use(errorHandler)

  return { app, consumer, publisher }
}
