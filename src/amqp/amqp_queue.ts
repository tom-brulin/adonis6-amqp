import { VineValidator } from '@vinejs/vine'
import { QueueHandler } from './queue_handler.js'
import { AmqpQueues } from './amqp_queues.js'
import { AmqpManager } from './amqp_manager.js'
import { Options } from 'amqplib'
import { Infer, SchemaTypes } from '@vinejs/vine/types'

export class AmqpQueue<
  Schema extends SchemaTypes,
  MetaData extends Record<string, any> | undefined,
> {
  private name: keyof AmqpQueues
  private validator: VineValidator<Schema, MetaData>
  private handler?: typeof QueueHandler

  constructor(
    name: keyof AmqpQueues,
    validator: VineValidator<Schema, MetaData>,
    private readonly amqpManager: AmqpManager
  ) {
    this.name = name
    this.validator = validator
  }

  useHandler(queueHandler: typeof QueueHandler) {
    if (!this.handler) {
      this.handler = queueHandler
    }
    return this
  }

  async register() {
    await this.amqpManager.registerQueue(this.name, this.validator, this.handler)
    return this
  }

  async sendMessage(
    content: Infer<typeof this.validator>,
    options?: Options.Publish
  ): Promise<boolean> {
    try {
      // @ts-expect-error Can't find out why I am getting this type error
      const payload = await this.validator.validate(content)
      const channel = await this.amqpManager.getOrCreateChannel()

      return channel.sendToQueue(this.name, this.toBuffer(payload), options)
    } catch (_) {
      return false
    }
  }

  private toBuffer(content: any) {
    return Buffer.isBuffer(content)
      ? content
      : Buffer.from(typeof content === 'object' ? JSON.stringify(content) : content)
  }
}
