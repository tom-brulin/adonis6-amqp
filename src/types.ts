import { VineValidator } from '@vinejs/vine'
import { QueueHandler } from './queue_handler.js'

export interface AmqpConfig {
  connection: {
    host: string
    port: number
    user: string
    password: string
  }
  queues: {
    [key: string]: {
      validator: VineValidator<any, any>
      handler?: typeof QueueHandler
    }
  }
}
