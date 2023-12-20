import { Channel, Options } from 'amqplib'
import { AmqpConfig } from '../types.js'
import { AmqpConnection } from './amqp_connection.js'
import { AmqpQueue } from './amqp_queue.js'
import { AmqpMessage } from './amqp_message.js'
import app from '@adonisjs/core/services/app'
import { errors as vineErrors } from '@vinejs/vine'
import { E_AMQP_INVALID_MESSAGE_FORMAT } from '../errors.js'

export class AmqpManager {
  readonly #connection: AmqpConnection

  #channel: Channel | null = null
  #channelPromise: Promise<Channel> | null = null

  constructor(config: AmqpConfig) {
    this.#connection = new AmqpConnection(this.buildConnectionString(config))
  }

  async shutdown() {
    this.#connection.close()
  }

  async registerQueue(queue: AmqpQueue) {
    await this.assertQueue(queue.name, { durable: true })

    if (queue.handler) {
      await this.consumeFrom(queue.name, async (message) => {
        const handler = await app.container.make(queue.handler)
        if (handler) {
          try {
            const payload = await queue.validator.validate(message.json)
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

  private buildConnectionString(config: AmqpConfig) {
    return `amqp://${config.connection.user}:${config.connection.password}@${config.connection.host}:${config.connection.port}`
  }
}
