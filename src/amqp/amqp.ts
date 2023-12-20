import { AmqpService } from './amqp_service.js'

let amqp: AmqpService

export function setAmqp(amqpService: AmqpService) {
  amqp = amqpService
}

export { amqp }
