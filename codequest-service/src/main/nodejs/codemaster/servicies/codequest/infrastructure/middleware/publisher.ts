export interface Publisher {
  connect(): Promise<void>
  publish(topic: string, event: object): Promise<void>
  isConnected(): boolean
  close(): Promise<void>
}
