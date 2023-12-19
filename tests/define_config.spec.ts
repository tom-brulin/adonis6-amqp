import { test } from '@japa/runner'
import { defineConfig } from '../index.js'
import { AppFactory } from '@adonisjs/core/factories/app'
import { ApplicationService } from '@adonisjs/core/types'
import vine from '@vinejs/vine'

const BASE_URL = new URL('./', import.meta.url)
const app = new AppFactory().create(BASE_URL, () => {}) as ApplicationService

test.group('Define config', () => {
  test('transform user defined config', async ({ expectTypeOf }) => {
    const config = await defineConfig({
      connection: {
        host: 'localhost',
        port: 5672,
        user: 'rabbitmq',
        password: 'rabbitmq',
      },
      queues: {
        'test.queue': {
          validator: vine.compile(vine.object({})),
        },
        'test2.queue': {
          validator: vine.compile(vine.object({})),
        },
      },
    }).resolver(app)

    type Queues = keyof typeof config.queues
    expectTypeOf<Queues>().toEqualTypeOf<'test.queue' | 'test2.queue'>()
  })
})
