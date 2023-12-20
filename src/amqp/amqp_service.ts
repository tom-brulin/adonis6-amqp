import { VineValidator } from '@vinejs/vine'
import { AmqpManager } from './amqp_manager.js'
import { AmqpQueues } from './amqp_queues.js'
import { AmqpQueue } from './amqp_queue.js'

export class AmqpService {
  constructor(private readonly amqpManager: AmqpManager) {}

  createQueue(queueName: keyof AmqpQueues, validator: VineValidator<any, any>) {
    return new AmqpQueue(queueName, validator, this.amqpManager)
  }
}
