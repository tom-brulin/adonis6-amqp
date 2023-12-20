import { configProvider } from '@adonisjs/core'
import { ApplicationService } from '@adonisjs/core/types'
import { RuntimeException } from '@poppinss/utils'
import { AmqpService } from '../src/amqp/amqp_service.js'
import { AmqpConfig } from '../src/types.js'
import { setAmqp } from '../src/amqp/amqp.js'
import { AmqpManager } from '../src/amqp/amqp_manager.js'

export default class AmqpProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    const amqpConfigProvider = this.app.config.get<AmqpConfig>('amqp')

    /**
     * Resolve config from the provider
     */
    const config = await configProvider.resolve<AmqpConfig>(this.app, amqpConfigProvider)
    if (!config) {
      throw new RuntimeException(
        'Invalid "config/amqp.ts" file. Make sure you are using the "defineConfig" method'
      )
    }

    /**
     * Initialize AMQP manager
     */
    const amqpManager = new AmqpManager(config)
    this.app.container.singleton(AmqpManager, () => amqpManager)

    /**
     * Initialize AMQP service
     */
    const amqpService = new AmqpService(amqpManager)
    setAmqp(amqpService)
  }

  async shutdown() {
    /**
     * Shutdown AMQP manager
     */
    const amqpManager = await this.app.container.make(AmqpManager)
    await amqpManager.shutdown()
  }
}
