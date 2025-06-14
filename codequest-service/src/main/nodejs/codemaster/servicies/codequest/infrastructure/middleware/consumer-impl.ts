import amqp, { Channel, ChannelModel, Message } from 'amqplib'
import { CodeQuestServiceImpl } from '../../application/codequest-service-impl'
import { Consumer } from './consumer'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost'
const EXCHANGE = 'authentication'
const MODE = 'topic'
const QUEUE = 'codequest-deleted-handler'
const ROUTING_KEY = 'user.deleted'

export class ConsumerImpl implements Consumer {
  private connection?: ChannelModel
  private channel?: Channel
  private consumerTag?: string

  constructor(private readonly service: CodeQuestServiceImpl) {}

  async start(): Promise<void> {
    try {
      console.log('[⏳] Connecting to RabbitMQ...')
      this.connection = await amqp.connect(RABBITMQ_URL)
      this.channel = await this.connection.createChannel()

      await this.channel.assertExchange(EXCHANGE, MODE, { durable: true })
      const { queue } = await this.channel.assertQueue(QUEUE, { durable: true })
      await this.channel.bindQueue(queue, EXCHANGE, ROUTING_KEY)

      const consumeResult = await this.channel.consume(queue, this.handleMessage, {
        noAck: false,
      })

      this.consumerTag = consumeResult.consumerTag
      console.log(`[👂] RabbitMQ consumer started. Listening on queue: ${QUEUE}`)
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

      await this.service.deleteAllCodequestsByAuthor(data.value)
      console.log(`[✅] Codequests deleted for author: ${data.value}`)
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
  }
}
