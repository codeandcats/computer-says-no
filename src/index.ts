import { pascal } from 'case';

const CFN_ERROR_IDENTIFIER = '$$cfn';

type Dictionary = { [K: string]: unknown };

type SerializableValue = (
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializableValue[]
  | { [K: string]: SerializableValue }
);

export type BaseErrorBody = Record<string, SerializableValue> | string;

type ErrorConstructor = BaseErrorBody | ((...args: any[]) => BaseErrorBody) | undefined;

type GetBaseErrorBody<TConstructor extends ErrorConstructor> = (
  TConstructor extends (...args: any[]) => BaseErrorBody
    ? (
      ReturnType<TConstructor> extends string
        ? { message: ReturnType<TConstructor> }
        : ReturnType<TConstructor>
    )
    : (
      TConstructor extends string
        ? { message: TConstructor }
        : (
          TConstructor extends undefined
            ? Record<string, unknown>
            : TConstructor
        )
    )
);

export type BaseError<
  TCode extends string,
  TConstructor extends ErrorConstructor
> = { code: TCode } & GetBaseErrorBody<TConstructor>;

type BaseErrorDefinition<
  TCode extends string,
  TConstructor extends ErrorConstructor
> = (
  {
    code: TCode
    is(err: unknown): err is BaseError<TCode, TConstructor>;
  } & (
    TConstructor extends ((...args: any[]) => BaseErrorBody)
      ? {
        (...args: Parameters<TConstructor>): BaseError<TCode, TConstructor>;
        new (...args: Parameters<TConstructor>): BaseError<TCode, TConstructor>;
      }
      : {
        (): BaseError<TCode, TConstructor>;
        new (): BaseError<TCode, TConstructor>;
      }
  )
);

function errorCodeToClassName(code: string) {
  return `${pascal(code)}Error`;
}

function getErrorBody<
  TCode extends string,
  TConstructor extends (...args: any[]) => BaseErrorBody,
>(code: TCode, create: TConstructor, args: Parameters<TConstructor>): BaseError<TCode, TConstructor>;

function getErrorBody<
  TCode extends string,
  TConstructor extends BaseErrorBody
>(code: TCode, create: TConstructor): BaseError<TCode, TConstructor>;

function getErrorBody<
  TCode extends string,
  TConstructor extends ErrorConstructor
>(
  code: TCode,
  create: TConstructor,
  args?: any
) {
  const bodyRaw = typeof create === 'function' ? create(...args) : create;

  const body = {
    ...(typeof bodyRaw === 'string'
      ? { message: bodyRaw }
      : bodyRaw as Exclude<GetBaseErrorBody<TConstructor>, string>),
    code,
  };

  return body;
}

export function defineError<
  TCode extends string,
  TConstructor extends ErrorConstructor
>(
  code: TCode,
  create?: TConstructor,
) {
  type Args = TConstructor extends () => BaseErrorBody ? Parameters<TConstructor> : never;

  function ErrorDefinition(
    this: BaseError<TCode, TConstructor>,
    ...args: Args
  ) {
    const body = typeof create === 'function'
      ? getErrorBody(code, create as (...a: any[]) => BaseErrorBody, args)
      : getErrorBody(code, create as BaseErrorBody);

    (body as any)[CFN_ERROR_IDENTIFIER] = 1;

    if (new.target) {
      Object.keys(body).forEach((key) => {
        (this as Dictionary)[key] = (body as Dictionary)[key];
      });
      return this;
    }

    return body;
  }
  ErrorDefinition.code = code;
  ErrorDefinition.is = (err: unknown): err is BaseError<TCode, TConstructor> => {
    const baseError = err as BaseError<TCode, TConstructor>;
    return baseError && baseError.code === code;
  };

  Object.defineProperty(ErrorDefinition, 'name', {
    value: errorCodeToClassName(code),
    writable: false,
  });

  return ErrorDefinition as unknown as BaseErrorDefinition<TCode, TConstructor>;
}

export function isError(value: unknown): value is { code: string; message?: string };
export function isError<
  TCode extends string,
  TConstructor extends ErrorConstructor,
  TErrorDefinition extends BaseErrorDefinition<TCode, TConstructor>
>(
  value: unknown,
  definition: TErrorDefinition
): value is BaseError<TCode, TConstructor>;

export function isError(value: unknown, definition?: BaseErrorDefinition<any, any>): boolean {
  const isCsnError = value && (value as any)[CFN_ERROR_IDENTIFIER];
  if (!isCsnError) {
    return false;
  }

  if (!definition) {
    return true;
  }

  return definition.is(value);
}
