import { Consumer } from '../main/nodejs/codemaster/servicies/community/infrastructure/middleware/consumer'

export class MockRabbitMqEventConsumer implements Consumer {
  private connected = true
  async close(): Promise<void> {
    this.connected = false
  }
  async start(): Promise<void> {
    this.connected = true
  }
}
