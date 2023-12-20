import { test } from '@japa/runner'
import { defineConfig } from '../index.js'
import { AppFactory } from '@adonisjs/core/factories/app'
import { ApplicationService } from '@adonisjs/core/types'

const BASE_URL = new URL('./', import.meta.url)
const app = new AppFactory().create(BASE_URL, () => {}) as ApplicationService

test.group('Define config', () => {
  test('transform user defined config', async ({ assert }) => {
    const config = await defineConfig({
      connection: {
        host: 'localhost',
        port: 5672,
        user: 'rabbitmq',
        password: 'rabbitmq',
      },
    }).resolver(app)

    assert.equal(config.connection.host, 'localhost')
    assert.equal(config.connection.port, 5672)
    assert.equal(config.connection.user, 'rabbitmq')
    assert.equal(config.connection.password, 'rabbitmq')
  })
})
