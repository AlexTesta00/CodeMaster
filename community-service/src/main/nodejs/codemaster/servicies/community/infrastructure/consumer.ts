import amqp, { Channel, ConsumeMessage } from 'amqplib'
import { CommunityServiceImpl } from '../application/community-service-impl'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq'
const EXCHANGE_CODEQUEST = 'codequest'
const EXCHANGE_USER = 'authentication'
const MODE = 'topic'

let connected = false
const service = new CommunityServiceImpl()

type UserDeletedMessage = { author: string }
type CodequestDeletedMessage = { questId: string }

export const startConsumer = async (): Promise<void> => {
  try {
    console.log('Connecting to RabbitMQ...')
    const connection = await amqp.connect(RABBITMQ_URL)
    console.log('Connected to RabbitMQ:', RABBITMQ_URL)

    const channel = await connection.createChannel()

    await setupConsumer(channel, EXCHANGE_USER, 'community-user-queue', 'user.*')
    await setupConsumer(
      channel,
      EXCHANGE_CODEQUEST,
      'community-codequest-queue',
      'codequest.*'
    )

    console.log('Waiting for messages..')
    connected = true
  } catch (err) {
    console.error('Failed to start RabbitMQ consumer:', err)
    connected = false
  }
}

export const isRabbitConnected = (): boolean => connected

async function setupConsumer(
  channel: Channel,
  exchange: string,
  queueName: string,
  pattern: string
) {
  await channel.assertExchange(exchange, MODE, { durable: true })
  const { queue } = await channel.assertQueue(queueName, { durable: true })
  await channel.bindQueue(queue, exchange, pattern)

  await channel.consume(queue, async (message: ConsumeMessage | null) => {
    if (!message) return

    const routingKey = message.fields.routingKey

    try {
      switch (routingKey) {
        case 'user.deleted': {
          const data = parseMessage<UserDeletedMessage>(message)
          await handleUserDeleted(data)
          break
        }

        case 'codequest.deleted': {
          const data = parseMessage<CodequestDeletedMessage>(message)
          await handleCodequestDeleted(data)
          break
        }

        default:
          console.warn(`No handler for routing key: ${routingKey}`)
      }
    } catch (err) {
      console.error(`Error processing message '${routingKey}':`, err)
    } finally {
      channel.ack(message)
    }
  })
}

function parseMessage<T>(message: ConsumeMessage): T {
  return JSON.parse(message.content.toString()) as T
}

async function handleUserDeleted(data: UserDeletedMessage): Promise<void> {
  await service.deleteCommentsByCodequest(data.author)
  console.log(`Processed user.deleted for nickname: ${data.author}`)
}

async function handleCodequestDeleted(data: CodequestDeletedMessage): Promise<void> {
  await service.deleteCommentsByAuthor(data.questId)
  console.log(`Processed codequest.deleted for questId: ${data.questId}`)
}
