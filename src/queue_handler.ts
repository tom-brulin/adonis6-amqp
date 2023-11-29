export abstract class QueueHandler {
  abstract handle(data: any): void
  abstract handleError(error: Error): void
}
