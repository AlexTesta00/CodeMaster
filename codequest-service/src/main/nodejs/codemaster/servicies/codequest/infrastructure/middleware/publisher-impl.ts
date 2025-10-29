import amqp, { ChannelModel } from 'amqplib'
import { Publisher } from './publisher'
import { CodequestGenerateEvent } from '../../domain/events/codequest-generate'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost'
const EXCHANGE = 'codequest'
const MODE = 'topic'

const QUEUE = 'codequest-deleted-queue'
const ROUTING_KEY = 'codequest.delete'

const CODEGEN_QUEUE = 'generator-codequest-generate'
const CODEGEN_ROUTING_KEY = 'codequest.codegen'

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

    await this.channel.assertQueue(CODEGEN_QUEUE, { durable: true })
    await this.channel.bindQueue(CODEGEN_QUEUE, EXCHANGE, CODEGEN_ROUTING_KEY)

    this.connected = true
  }

  async publish(topic: string, event: object): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ not connected. Call connect() first.')
    }

    console.log(`Send message to RabbitMQ [${topic}]: `, event)
    const message = Buffer.from(JSON.stringify(event))
    this.channel.publish(EXCHANGE, topic, message)
  }

  async sendToCodeGenerator(event: CodequestGenerateEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ not connected. Call connect() first.')
    }

    console.log('Send message to CodeGeneratorService: ', event)
    const message = Buffer.from(JSON.stringify(event))
    this.channel.publish(EXCHANGE, CODEGEN_ROUTING_KEY, message)
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
