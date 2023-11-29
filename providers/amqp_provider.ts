import { configProvider } from '@adonisjs/core'
import { ApplicationService } from '@adonisjs/core/types'
import { RuntimeException } from '@poppinss/utils'
import { AmqpManager } from '../src/amqp_manager.js'
import { AmqpConfig } from '../src/types.js'
import { Amqp } from '../src/amqp.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'amqp.manager': AmqpManager
  }
}

export default class AmqpProvider {
  constructor(protected app: ApplicationService) {}

  async register() {
    this.app.container.singleton('amqp.manager', async () => {
      const amqpConfigProvider = this.app.config.get('amqp')
      const config = await configProvider.resolve<AmqpConfig>(this.app, amqpConfigProvider)

      if (!config) {
        throw new RuntimeException(
          'Invalid "config/amqp.ts" file. Make sure you are using the "defineConfig" method'
        )
      }

      return new AmqpManager(config)
    })

    this.app.container.bind(Amqp, async (resolver) => {
      const amqpManager = await resolver.make('amqp.manager')
      return new Amqp(amqpManager)
    })
  }

  async boot() {
    const amqp = await this.app.container.make('amqp.manager')
    amqp.boot()
  }

  async shutdown() {
    const amqp = await this.app.container.make('amqp.manager')
    await amqp.shutdown()
  }
}
