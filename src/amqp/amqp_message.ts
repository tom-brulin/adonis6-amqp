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

  ack(allUpTo: boolean = false) {
    this.channel.ack(this.message, allUpTo)
  }

  nack(allUpTo: boolean = false, requeue: boolean = true) {
    this.channel.nack(this.message, allUpTo, requeue)
  }

  reject(requeue: boolean = true) {
    this.channel.reject(this.message, requeue)
  }

  get content() {
    return this.message.content.toString()
  }

  get json() {
    try {
      return JSON.parse(this.content)
    } catch (e) {
      throw new E_AMQP_MESSAGE_JSON_PARSE()
    }
  }

  get fields() {
    return this.message.fields
  }

  get properties() {
    return this.message.properties
  }
}
