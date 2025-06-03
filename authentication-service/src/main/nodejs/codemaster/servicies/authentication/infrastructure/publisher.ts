import amqp from 'amqplib'
import { UserId } from '../domain/user'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq'
const EXCHANGE = 'authentication'
const MODE = 'topic'
let channel: amqp.Channel
let connected = false

export const connectToRabbit = async () => {
  const connection = await amqp.connect(RABBITMQ_URL)
  channel = await connection.createChannel()
  await channel.assertExchange(EXCHANGE, MODE, { durable: true })
  connected = true
}

export const publishUserRegistered = async (nickname: UserId) => {
  const message = Buffer.from(JSON.stringify(nickname))
  channel.publish(EXCHANGE, 'user.registered', message)
}

export const publishUserDeleted = async (nickname: UserId) => {
  const message = Buffer.from(JSON.stringify(nickname))
  channel.publish(EXCHANGE, 'user.deleted', message)
}

export const isRabbitConnected = (): boolean => connected
