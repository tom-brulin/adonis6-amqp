import { VineValidator } from '@vinejs/vine'
import { QueueHandler } from './queue_handler.js'
import { AmqpQueues } from './amqp_queues.js'
import { AmqpManager } from './amqp_manager.js'
import { Infer } from '@vinejs/vine/types'
import { Options } from 'amqplib'

export class AmqpQueue {
  #name: string
  #validator: VineValidator<any, any>
  #handler?: typeof QueueHandler

  constructor(
    name: keyof AmqpQueues,
    validator: VineValidator<any, any>,
    private readonly amqpManager: AmqpManager
  ) {
    this.#name = name
    this.#validator = validator
  }

  useHandler(queueHandler: typeof QueueHandler) {
    this.#handler = queueHandler
    return this
  }

  async register() {
    await this.amqpManager.registerQueue(this)
    return this
  }

  async sendMessage(
    content: Infer<typeof this.validator>,
    options: Options.Publish
  ): Promise<boolean> {
    try {
      const payload = await this.validator.validate(content)
      const channel = await this.amqpManager.getOrCreateChannel()

      return channel.sendToQueue(this.name, this.toBuffer(payload), options)
    } catch (_) {
      return false
    }
  }

  get name() {
    return this.#name
  }

  get validator() {
    return this.#validator
  }

  get handler() {
    return this.#handler
  }

  private toBuffer(content: any) {
    return Buffer.isBuffer(content)
      ? content
      : Buffer.from(typeof content === 'object' ? JSON.stringify(content) : content)
  }
}
