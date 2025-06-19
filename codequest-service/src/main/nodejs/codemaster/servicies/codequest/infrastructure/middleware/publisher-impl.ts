import amqp, { ChannelModel } from 'amqplib'
import { Publisher } from './publisher'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost'
const EXCHANGE = 'codequest'
const MODE = 'topic'
const QUEUE = 'codequest-deleted-queue'
const ROUTING_KEY = 'codequest.delete'

export class PublisherImpl implements Publisher {
  private channel?: amqp.Channel
  private connection?: ChannelModel
  private connected = false

  async connect(): Promise<void> {
    this.connection = await amqp.connect(RABBITMQ_URL)
    this.channel = await this.connection.createChannel()
    await this.channel.assertExchange(EXCHANGE, MODE, { durable: true })

    await this.channel.assertQueue(QUEUE, { durable: true })
    await this.channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY)
    this.connected = true
  }

  async publish(topic: string, event: object): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ not connected. Call connect() first.')
    }

    console.log('Send message to rabbimq: ', event)
    const message = Buffer.from(JSON.stringify(event))
    this.channel.publish(EXCHANGE, topic, message)
  }

  isConnected() {
    return this.connected
  }

  async close(): Promise<void> {
    await this.channel?.close()
    await this.connection?.close()
    this.connected = false
  }
}
