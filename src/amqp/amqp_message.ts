import { Channel, ConsumeMessage } from 'amqplib'
import { E_AMQP_MESSAGE_JSON_PARSE } from '../errors.js'

export class AmqpMessage {
  message: ConsumeMessage

  constructor(
    private readonly channel: Channel,
    message: ConsumeMessage | null
  ) {
    if (message === null) {
      throw new Error('Message expected, received null.')
    }

    this.message = message
  }

  /**
   * Acknowledge the message
   *
   * @param allUpTo Acknowledge all the messages up to this
   */
  ack(allUpTo: boolean = false) {
    this.channel.ack(this.message, allUpTo)
  }

  /**
   * Rejects the message
   *
   * @param allUpTo Acknowledge all the messages up to this
   * @param requeue Adds back to the queue
   */
  nack(allUpTo: boolean = false, requeue: boolean = true) {
    this.channel.nack(this.message, allUpTo, requeue)
  }

  /**
   * Rejects the message. Equivalent to nack, but worker in older
   * versions of RabbitMQ, where nack does not
   *
   * @param requeue Adds back to the queue
   */
  reject(requeue: boolean = true) {
    this.channel.reject(this.message, requeue)
  }

  /**
   * The message content
   */
  get content() {
    return this.message.content.toString()
  }

  /**
   * The message content as a buffer
   */
  get json() {
    try {
      return JSON.parse(this.content)
    } catch (e) {
      throw new E_AMQP_MESSAGE_JSON_PARSE()
    }
  }

  /**
   * The message fields
   */
  get fields() {
    return this.message.fields
  }

  /**
   * The message properties
   */
  get properties() {
    return this.message.properties
  }
}
