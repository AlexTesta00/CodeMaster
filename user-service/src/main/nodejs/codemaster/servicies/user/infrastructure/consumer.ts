import amqp from 'amqplib'
import {
  changeUserTrophy,
  deleteUser,
  registerNewUser,
} from '../application/user-service'
import { TaskEither, tryCatch } from 'fp-ts/TaskEither'
import { createTrophy } from '../domain/trophy-factory'
import { isRight } from 'fp-ts/Either'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq'
const QUEUE_NAME = 'user-service-queue'
const EXCHANGE = 'authentication'
const MODE = 'topic'
let connected = false

export const startConsumer: TaskEither<Error, void> = tryCatch(
  async () => {
    try {
      console.log('[⏳] Connecting to RabbitMQ...')
      const connection = await amqp.connect(RABBITMQ_URL)
      console.log('[✅] Connected to RabbitMQ: ', RABBITMQ_URL)

      const channel = await connection.createChannel()
      await channel.assertExchange(EXCHANGE, MODE, { durable: true })
      const queue = await channel.assertQueue(QUEUE_NAME, { durable: true })
      await channel.bindQueue(queue.queue, EXCHANGE, 'user.*')

      await channel.consume(queue.queue, async (message) => {
        console.log('[📥] Message received from RabbitMQ')
        if (!message) return
        const data = JSON.parse(message.content.toString())
        const routingKey = message.fields.routingKey
        console.log(`[📥] Received message with routing key: ${routingKey}`, data)

        try {
          if (routingKey === 'user.registered') {
            await registerNewUser(data)
            const welcomeTrophy = createTrophy(
              'Welcome',
              'Welcome to the platform!',
              'https://cdn-icons-png.flaticon.com/512/14697/14697227.png',
              1
            )
            if (isRight(welcomeTrophy)) {
              await changeUserTrophy(data, [welcomeTrophy.right])
              console.log(`[✅] Welcome Trophy Assigned`)
            }
            console.log(`[✅] User registered`)
          } else if (routingKey === 'user.deleted') {
            await deleteUser(data)
            console.log(`[✅] User deleted`)
          }
          channel.ack(message)
        } catch (error) {
          console.error('Error handling message: ', error)
          channel.ack(message)
        }
      })
      console.log('[👂] Waiting for messages...')
      connected = true
    } catch (err) {
      console.error('[❌] Error during RabbitMQ consumer setup:', err)
      connected = false
      throw err
    }
  },
  (reason) => (reason instanceof Error ? reason : new Error(String(reason)))
)

export const isRabbitConnected = (): boolean => connected
