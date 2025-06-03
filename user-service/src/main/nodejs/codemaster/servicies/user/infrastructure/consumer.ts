import amqp from 'amqplib'
import { deleteUser, registerNewUser } from '../application/user-service'
import { TaskEither, tryCatch } from 'fp-ts/TaskEither'

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
            console.log(`[✅] User registered: ${data.nickname}`)
          } else if (routingKey === 'user.deleted') {
            await deleteUser(data)
            console.log(`[✅] User deleted: ${data.nickname}`)
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
