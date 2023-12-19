import { configProvider } from '@adonisjs/core'
import { ConfigProvider } from '@adonisjs/core/types'
import { AmqpConfig, Queue } from './types.js'

type ResolvedConfig<KnownQueues extends Record<string, Queue>> = {
  connection: AmqpConfig<KnownQueues>['connection']
  queues: {
    [K in keyof KnownQueues]: KnownQueues[K]
  }
}

export function defineConfig<KnownQueues extends Record<string, Queue>>(
  config: AmqpConfig<KnownQueues>
): ConfigProvider<ResolvedConfig<KnownQueues>> {
  return configProvider.create(async () => {
    return config
  })
}
