import { Channel, Options } from 'amqplib'
import { AmqpConfig, Queue } from '../types.js'
import { AmpqConnection } from './amqp_connection.js'
import { AmqpMessage } from './amqp_message.js'
import { E_AMQP_INVALID_MESSAGE_FORMAT } from '../errors.js'
import app from '@adonisjs/core/services/app'
import { errors as vineErrors } from '@vinejs/vine'

export class AmqpManager<KnownQueues extends Record<string, Queue>> {
  readonly #connection: AmpqConnection
  readonly queues: AmqpConfig<KnownQueues>['queues']

  #channel: Channel | null = null
  #channelPromise: Promise<Channel> | null = null

  constructor(config: AmqpConfig<KnownQueues>) {
    const url = `amqp://${config.connection.user}:${config.connection.password}@${config.connection.host}:${config.connection.port}`
    this.#connection = new AmpqConnection(url)
    this.queues = config.queues
  }

  async boot() {
    for (const [name, config] of Object.entries(this.queues)) {
      await this.registerQueue(name, config)
    }
  }

  async shutdown() {
    await this.#connection.close()
  }

  async getOrCreateChannel() {
    const connection = await this.#connection.getOrCreate()

    if (!this.#channel) {
      if (!this.#channelPromise) {
        this.#channelPromise = connection.createChannel()
      }
      this.#channel = await this.#channelPromise
    }

    return this.#channel
  }

  toBuffer(content: any) {
    return Buffer.isBuffer(content)
      ? content
      : Buffer.from(typeof content === 'object' ? JSON.stringify(content) : content)
  }

  private async registerQueue(queueName: string, queueConfig: Queue) {
    await this.assertQueue(queueName, { durable: true })

    if (queueConfig.handler) {
      await this.consumeFrom(queueName, async (message) => {
        const handler = await app.container.make(queueConfig.handler)
        if (handler) {
          try {
            const payload = await queueConfig.validator.validate(message.json)
            await handler.handle(payload)
          } catch (error) {
            if (error instanceof vineErrors.E_VALIDATION_ERROR) {
              handler.handleError(new E_AMQP_INVALID_MESSAGE_FORMAT())
            } else {
              handler.handleError(error)
            }
          }
        }

        message.ack()
      })
    }
  }

  private async assertQueue(queueName: string, options?: Options.AssertQueue) {
    const channel = await this.getOrCreateChannel()
    return channel.assertQueue(queueName, options)
  }

  private async consumeFrom(
    queueName: string,
    onMessage: (msg: AmqpMessage) => void | Promise<void>
  ) {
    const channel = await this.getOrCreateChannel()

    return channel.consume(queueName, (message) => {
      onMessage(new AmqpMessage(channel, message))
    })
  }
}
