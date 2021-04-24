export interface RequestHandler {
  canHandle(requestName: string): boolean;

  validate?(data: any): RequestValidationError;
  simpleValidate?(data: any): boolean;

  handle?(data: any): Promise<ResponseObject>;
  handleSync?(data: any): ResponseObject;
}

export interface StrictRequestHandler {
  canHandle(requestName: string): boolean;
  validate(data: any): RequestValidationError;
  handle(data: any): Promise<ResponseObject>;
}

export interface RequestValidationError {
  valid: boolean;
  error?: string;
}

export interface ResponseObject {
  error?: string;
  [k: string]: any;
}
