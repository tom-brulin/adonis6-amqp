import { Options } from 'amqplib'
import { E_AMQP_QUEUE_NOT_REGISTERED } from './errors.js'
import { AmqpManager } from './amqp_manager.js'

export class Amqp {
  constructor(private readonly amqpManager: AmqpManager) {}

  async sendToQueue(queueName: string, content: any, options?: Options.Publish): Promise<boolean> {
    const queue = this.amqpManager.queues[queueName]
    if (queue === undefined) {
      throw new E_AMQP_QUEUE_NOT_REGISTERED([queueName])
    }

    try {
      const payload = await queue.validator.validate(content)
      const channel = await this.amqpManager.getOrCreateChannel()
      return channel.sendToQueue(queueName, this.amqpManager.toBuffer(payload), options)
    } catch (_) {
      return false
    }
  }
}
