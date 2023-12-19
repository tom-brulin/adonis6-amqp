import { AmqpService } from '../amqp/amqp_service.js'

let amqp: AmqpService<any>

export function setAmqp(amqpService: AmqpService<any>) {
  amqp = amqpService
}

export { amqp as default }
