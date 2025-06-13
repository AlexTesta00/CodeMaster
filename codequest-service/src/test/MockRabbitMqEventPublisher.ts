import { Publisher } from '../main/nodejs/codemaster/servicies/codequest/infrastructure/middleware/publisher'

export class MockRabbitMqEventPublisher implements Publisher {
  private connected = true
  async connect() { this.connected = true }
  async publish(topic: string, event: object) { /* mock */ }
  isConnected() { return this.connected }
  async close() { this.connected = false }
}
