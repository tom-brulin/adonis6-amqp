import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { IgnitorFactory } from '@adonisjs/core/factories'
import Configure from '@adonisjs/core/commands/configure'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('Configure', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = fileURLToPath(BASE_URL)
  })

  test('create config file and register provider', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    await fs.create('.env', '')
    await fs.createJson('tsconfig.json', {})
    await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)
    await fs.create('adonisrc.ts', `export default defineConfig({})`)

    const ace = await app.container.make('ace')

    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileExists('config/amqp.ts')
    await assert.fileExists('start/amqp.ts')
    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', 'adonis6-amqp/amqp_provider')
    await assert.fileContains('config/amqp.ts', 'defineConfig')

    await assert.fileContains('.env', 'AMQP_HOST')
    await assert.fileContains('.env', 'AMQP_PORT')
    await assert.fileContains('.env', 'AMQP_USER')
    await assert.fileContains('.env', 'AMQP_PASSWORD')

    await assert.fileContains('start/env.ts', 'AMQP_HOST: Env.schema.string({ format: "host" })')
    await assert.fileContains('start/env.ts', 'AMQP_PORT: Env.schema.number()')
    await assert.fileContains('start/env.ts', 'AMQP_USER: Env.schema.string()')
    await assert.fileContains('start/env.ts', 'AMQP_PASSWORD: Env.schema.string()')
  }).timeout(1000 * 60)
})
