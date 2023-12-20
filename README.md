# adonis6-amqp

<br />

[![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

## Introduction

Typesafe AMQP provider for AdonisJS 6. Feel free to contribute or give suggestions.

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

Once installed, you can configure Adonis6 AMQP in you application inside `config/amqp.ts`.

```typescript
const amqpConfig = defineConfig({
  connection: {
    host: env.get('AMQP_HOST'),
    port: env.get('AMQP_PORT'),
    user: env.get('AMQP_USER'),
    password: env.get('AMQP_PASSWORD'),
  }
})

declare module 'adonis6-amqp' {
  interface AmqpQueues {
    // 'your.queue': Infer<typeof yourValidator>
  }
}
```

### Create a queue

Define your queues inside `start/amqp.ts`.

```typescript
import { amqp } from 'adonis6-amqp'

export const yourQueue = await amqp
  .createQueue('your.queue', yourValidator)
  .useHandler(YourHandler) // Optional
  .register()
```

#### Validator

Each queues need a validator to validate incoming/outgoing data (you must use `vinejs` to create queue validators).

```typescript
import vine from '@vinejs/vine'

export const yourValidator = vine.compile(
  vine.object({
    randomString: vine.string(),
  })
)
```

#### Handler

If you want to listen on the queue you need to create a queue handler.

```typescript
import { Infer } from '@vinejs/vine/types'
import { QueueHandler } from 'adonis6-amqp'

export class YourHandler extends QueueHandler {
  handle(data: Infer<typeof yourValidator>) { }
  handleError(error: Error) { }
}
```

### Send message to queue

Just import the queue you registered where you want to send a message.

```typescript
import { yourQueue } from '#start/amqp'

// Typesafe
yourQueue.sendMessage({ randomString: 'test' })
```

## License

Adonis6 AMQP is open-sourced software licensed under the [MIT license](LICENSE.md).

[npm-image]: https://img.shields.io/npm/v/adonis6-amqp/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/adonis6-amqp/v/latest "npm"
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/tom-brulin/adonis6-amqp?style=for-the-badge
