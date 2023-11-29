The package has been configured successfully. The configuration is stored inside the `config/amqp.ts` file.

## Validating environment variables
adonis6-amqp config relies on environment variables for the credentials. We recommend you to validate environment variables inside the `env.ts` file.

### Variables

```ts
AMQP_HOST: Env.schema.string({ format: 'host' }),
AMQP_PORT: Env.schema.number(),
AMQP_USER: Env.schema.string(),
AMQP_PASSWORD: Env.schema.string(),
```
