import Configure from '@adonisjs/core/commands/configure'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await command.publishStub('config.stub', {})

  /**
   * Publish provider
   */
  await codemods.updateRcFile((rcFile: any) => {
    rcFile.addProvider('adonis6-amqp/amqp_provider')
  })

  /**
   * Define env variables
   */
  await codemods.defineEnvVariables({
    AMQP_HOST: 'localhost',
    AMQP_PORT: 5672,
    AMQP_USER: 'rabbitmq',
    AMQP_PASSWORD: 'rabbitmq',
  })

  /**
   * Define env variables validation
   */
  await codemods.defineEnvValidations({
    variables: {
      AMQP_HOST: 'Env.schema.string({ format: "host" })',
      AMQP_PORT: 'Env.schema.number()',
      AMQP_USER: 'Env.schema.string()',
      AMQP_PASSWORD: 'Env.schema.string()',
    },
    leadingComment: 'AMQP',
  })
}
