import { CodequestGenerateEvent } from '../main/nodejs/codemaster/servicies/codequest/domain/events/codequest-generate'
import { Publisher } from '../main/nodejs/codemaster/servicies/codequest/infrastructure/middleware/publisher'

export class MockRabbitMqEventPublisher implements Publisher {
  private connected = true

  async sendToCodeGenerator(event: CodequestGenerateEvent) {}

  async connect() {
    this.connected = true
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async publish(topic: string, event: object) {}
  isConnected() {
    return this.connected
  }
  async close() {
    this.connected = false
  }
}
