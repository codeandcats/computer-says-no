import { pascal } from 'case';

const CSN_ERROR_SIGNATURE_KEY = '__csn__' as const;
const CSN_ERROR_SIGNATURE_VALUE = 1 as const;

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
  (TConstructor extends (...args: any[]) => BaseErrorBody
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
  ) & {
    [CSN_ERROR_SIGNATURE_KEY]: typeof CSN_ERROR_SIGNATURE_VALUE;
  }
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
    code: TCode;
    name: string;
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
    let body =
      typeof create === 'function'
        ? getErrorBody(code, create as (...a: any[]) => BaseErrorBody, args)
        : getErrorBody(code, create as BaseErrorBody);

    body = JSON.parse(
      JSON.stringify({
        ...(body as Record<string, SerializableValue>),
        [CSN_ERROR_SIGNATURE_KEY]: CSN_ERROR_SIGNATURE_VALUE,
      }),
    );

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
  const isCsnError = value && (value as any)[CSN_ERROR_SIGNATURE_KEY];
  if (!isCsnError) {
    return false;
  }

  if (!definition) {
    return true;
  }

  return definition.is(value);
}
