import { Options } from 'amqplib'
import { Queue } from '../types.js'
import { Infer } from '@vinejs/vine/types'
import { AmqpManager } from './amqp_manager.js'

export class AmqpService<KnownQueues extends Record<string, Queue>> {
  constructor(private readonly amqpManager: AmqpManager<KnownQueues>) {}

  async sendToQueue(
    queueName: keyof KnownQueues,
    content: Infer<KnownQueues[typeof queueName]['validator']>,
    options?: Options.Publish
  ): Promise<boolean> {
    const queue = this.amqpManager.queues[queueName]

    if (!queue) {
      throw new Error(`Queue ${queueName.toString()} is not defined`)
    }

    try {
      const payload = await queue.validator.validate(content)
      const channel = await this.amqpManager.getOrCreateChannel()

      return channel.sendToQueue(queueName.toString(), this.amqpManager.toBuffer(payload), options)
    } catch (_) {
      return false
    }
  }
}
