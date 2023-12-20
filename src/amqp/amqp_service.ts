import { VineValidator } from '@vinejs/vine'
import { AmqpManager } from './amqp_manager.js'
import { AmqpQueues } from './amqp_queues.js'
import { AmqpQueue } from './amqp_queue.js'
import { SchemaTypes } from '@vinejs/vine/types'

export class AmqpService {
  constructor(private readonly amqpManager: AmqpManager) {}

  createQueue<Schema extends SchemaTypes, MetaData extends Record<string, any> | undefined>(
    queueName: keyof AmqpQueues,
    validator: VineValidator<Schema, MetaData>
  ) {
    return new AmqpQueue(queueName, validator, this.amqpManager)
  }
}
