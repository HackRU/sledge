export interface RequestHandler {
  canHandle(data: object): boolean;
  handle(data: object): Promise<object>;
}
