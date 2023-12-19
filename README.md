# adonis6-amqp

<br />

[![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

## Introduction

AMQP provider for AdonisJS. Feel free to contribute or give suggestions.

## Quick setup

### Install the library
```sh
npm i adonis6-amqp
```
```sh
yarn add adonis6-amqp
```
```sh
pnpm add adonis6-amqp
```

### Configure
```sh
node ace configure adonis6-amqp
```

## Setup

Once installed, you can configure Adonis6 AMQP in you application inside `config/amqp.ts`

```typescript
const amqpConfig = defineConfig({
  connection: {
    host: env.get('AMQP_HOST'),
    port: env.get('AMQP_PORT'),
    user: env.get('AMQP_USER'),
    password: env.get('AMQP_PASSWORD'),
  },
  queues: {
    /*
    'your.queue': {
      validator: yourValidator,
      handler: yourQueueHandler,
    },
    */
  },
})
```

### Create a queue

Each queues need a validator to validate incoming/outgoing data (you must use `vinejs` to create our validators).

```typescript
import vine from '@vinejs/vine'

export const yourValidator = vine.compile(
  vine.object({
    randomString: vine.string(),
  })
)
```

If you want to listen on the queue you can create a queue handler.

```typescript
import { Infer } from '@vinejs/vine/types'
import { QueueHandler } from 'adonis6-amqp'

export class YourHandler extends QueueHandler {
  handle(data: Infer<typeof yourValidator>) { }
  handleError(error: Error) { }
}
```

### Send message to queue

To send message to queue you need to use `AmqpService` provided in the IoC.

```typescript
const amqpService = await app.container.make(AmqpService)

amqpService.sendToQueue('queue.name', { someData: '' })
```

## License

Adonis6 AMQP is open-sourced software licensed under the [MIT license](LICENSE.md).

[npm-image]: https://img.shields.io/npm/v/adonis6-amqp/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/adonis6-amqp/v/latest "npm"
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/tom-brulin/adonis6-amqp?style=for-the-badge
