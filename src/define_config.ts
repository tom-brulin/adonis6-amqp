import { configProvider } from '@adonisjs/core'
import { ConfigProvider } from '@adonisjs/core/types'
import { AmqpConfig } from './types.js'

export function defineConfig(config: AmqpConfig): ConfigProvider<AmqpConfig> {
  return configProvider.create(async () => {
    return config
  })
}
