import amqp, { Channel, ChannelModel, Message } from 'amqplib'
import { CommunityServiceImpl } from '../../application/community-service-impl'
import { Consumer } from './consumer'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost'

// Exchanges
const EXCHANGES = [
  { name: 'authentication', routingKey: 'user.deleted', queue: 'community-user-deleted' },
  {
    name: 'codequest',
    routingKey: 'codequest.deleted',
    queue: 'community-comment-deleted',
  },
]

let rabbitConnected = false

const MODE = 'topic'

export class ConsumerImpl implements Consumer {
  private connection?: ChannelModel
  private channel?: Channel
  private consumerTags: string[] = []

  constructor(private readonly service: CommunityServiceImpl) {}

  async start(): Promise<void> {
    try {
      console.log('[⏳] Connecting to RabbitMQ...')
      this.connection = await amqp.connect(RABBITMQ_URL)
      this.channel = await this.connection.createChannel()

      for (const { name: exchange, routingKey, queue } of EXCHANGES) {
        await this.channel.assertExchange(exchange, MODE, { durable: true })
        const { queue: actualQueue } = await this.channel.assertQueue(queue, {
          durable: true,
        })
        await this.channel.bindQueue(actualQueue, exchange, routingKey)

        const consumeResult = await this.channel.consume(
          actualQueue,
          this.handleMessage,
          {
            noAck: false,
          }
        )

        this.consumerTags.push(consumeResult.consumerTag)
        console.log(`[👂] Listening on queue: ${actualQueue} for ${routingKey}`)
      }

      console.log('[✅] RabbitMQ consumer fully started.')
      setRabbitConnected()
    } catch (err) {
      console.error('[❌] Error during RabbitMQ consumer setup:', err)
      throw err
    }
  }

  private handleMessage = async (message: Message | null): Promise<void> => {
    if (!message) return

    try {
      const data = JSON.parse(message.content.toString())
      const routingKey = message.fields.routingKey
      console.log(`[📥] Received message with routing key: ${routingKey}`, data)

      switch (routingKey) {
        case 'user.deleted':
          await this.service.deleteCommentsByAuthor(data.value)
          console.log(`[✅] Comments deleted for user: ${data.value}`)
          break

        case 'codequest.deleted':
          await this.service.deleteCommentsByCodequest(data.questId)
          console.log(`[✅] Comments deleted for codequest: ${data.questId}`)
          break

        default:
          console.warn(`[⚠️] Unknown routing key: ${routingKey}`)
      }
    } catch (error) {
      console.error('❌ Error handling message:', error)
    } finally {
      this.channel?.ack(message)
    }
  }

  async close(): Promise<void> {
    if (this.channel) await this.channel.close()
    if (this.connection) await this.connection.close()
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log('[info] RabbitMQ connection closed with delay')
    setRabbitDisconnected()
  }
}

export function setRabbitConnected() {
  rabbitConnected = true
}

export function setRabbitDisconnected() {
  rabbitConnected = false
}

export function isRabbitConnected(): boolean {
  return rabbitConnected
}
