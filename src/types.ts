import { VineValidator } from '@vinejs/vine'
import { QueueHandler } from './amqp/queue_handler.js'

export interface Queue {
  validator: VineValidator<any, any>
  handler?: typeof QueueHandler
}

export interface AmqpConfig<KnownQueues extends Record<string, Queue>> {
  connection: {
    host: string
    port: number
    user: string
    password: string
  }
  queues: KnownQueues
}
