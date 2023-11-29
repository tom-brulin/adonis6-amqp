import app from '@adonisjs/core/services/app'
import { errors as vineErrors } from '@vinejs/vine'
import AmpqConnection from './amqp_connection.js'
import { AmqpConfig } from './types.js'
import { Channel, Options } from 'amqplib'
import { E_AMQP_INVALID_MESSAGE_FORMAT } from './errors.js'
import AmqpMessage from './amqp_message.js'

export class AmqpManager {
  readonly #connection: AmpqConnection
  readonly queues: AmqpConfig['queues']

  #channel: Channel | null = null
  #channelPromise: Promise<Channel> | null = null

  constructor(config: AmqpConfig) {
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

  private async registerQueue(name: string, config: AmqpConfig['queues'][string]) {
    await this.assertQueue(name, { durable: true })

    if (config.handler) {
      await this.consumeFrom(name, async (message) => {
        const handler = await app.container.make(config.handler)
        if (handler) {
          try {
            const payload = await config.validator.validate(message.json)
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
