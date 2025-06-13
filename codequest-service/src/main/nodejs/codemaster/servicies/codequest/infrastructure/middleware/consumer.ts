export interface Consumer {
  start(): Promise<void>
  close(): Promise<void>
}
