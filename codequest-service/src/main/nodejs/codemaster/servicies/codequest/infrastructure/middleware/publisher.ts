import {CodequestGenerateEvent} from "../../domain/events/codequest-generate";

export interface Publisher {
  connect(): Promise<void>
  publish(topic: string, event: object): Promise<void>
  sendToCodeGenerator(event: CodequestGenerateEvent): Promise<void>
  isConnected(): boolean
  close(): Promise<void>
}
