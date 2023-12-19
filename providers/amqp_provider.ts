import { configProvider } from '@adonisjs/core'
import { ApplicationService } from '@adonisjs/core/types'
import { RuntimeException } from '@poppinss/utils'
import { setAmqp } from '../src/services/amqp.js'
import { AmqpService } from '../index.js'
import { AmqpManager } from '../src/amqp/amqp_manager.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'amqp.manager': AmqpManager<any>
  }
}

export default class AmqpProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    const amqpConfigProvider = this.app.config.get<any>('amqp')

    /**
     * Resolve config from the provider
     */
    const config = await configProvider.resolve<any>(this.app, amqpConfigProvider)
    if (!config) {
      throw new RuntimeException(
        'Invalid "config/amqp.ts" file. Make sure you are using the "defineConfig" method'
      )
    }

    /**
     * Register and boot AMQP Manager
     */
    const amqpManager = new AmqpManager(config)
    this.app.container.singleton('amqp.manager', async () => {
      return amqpManager
    })
    amqpManager.boot()

    /**
     * Create AMQP service
     */
    const amqpService = new AmqpService<typeof config.queues>(amqpManager)
    setAmqp(amqpService)
  }

  async shutdown() {
    /**
     * Shutdown AMQP manager
     */
    const amqp = await this.app.container.make('amqp.manager')
    await amqp.shutdown()
  }
}
