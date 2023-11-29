import { Connection, connect } from 'amqplib'

export default class AmpqConnection {
  #connection: Connection | null = null
  #connectionPromise: Promise<Connection> | null = null

  constructor(private readonly url: string) {}

  async getOrCreate() {
    if (!this.#connection) {
      if (!this.#connectionPromise) {
        this.#connectionPromise = connect(this.url)
      }
      this.#connection = await this.#connectionPromise
    }

    return this.#connection
  }

  async close() {
    if (this.#connection) {
      await this.#connection.close()
    }
  }
}
