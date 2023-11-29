import { createError } from '@adonisjs/core/exceptions'

export const E_AMQP_MESSAGE_JSON_PARSE = createError(
  'Unable to parse message to JSON',
  'E_AMQP_MESSAGE_JSON_PARSE',
  422
)

export const E_AMQP_INVALID_MESSAGE_FORMAT = createError(
  'Invalid message format',
  'E_AMQP_INVALID_MESSAGE_FORMAT',
  422
)

export const E_AMQP_QUEUE_NOT_REGISTERED = createError<[string]>(
  'Queue "%s" not registered',
  'E_AMQP_QUEUE_NOT_REGISTERED',
  500
)
