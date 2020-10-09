type Dictionary = { [K: string]: unknown };

type BaseErrorBody = { message: string } | string;

type BaseError<
  TCode extends string,
  TBody extends BaseErrorBody
> = {
  code: TCode;
} & (
  TBody extends string
    ? { message: TBody }
    : TBody
);

interface BaseErrorClass<
  TCode extends string,
  TArgs extends unknown[],
  TBody extends BaseErrorBody
> {
  (...args: TArgs): BaseError<TCode, TBody>;
  new (...args: TArgs): BaseError<TCode, TBody>;
  code: TCode;
  is(err: unknown): err is BaseError<TCode, TBody>;
}

export function defineError<
  TCode extends string,
  TArgs extends unknown[],
  TBody extends BaseErrorBody
>(
  code: TCode,
  create: (...args: TArgs) => TBody
) {
  function ErrorConstructor(this: BaseError<TCode, TBody>, ...args: TArgs) {
    const body = create(...args);
    const bodyNormalised = { ...(typeof body === 'string' ? { message: body } : body as Exclude<TBody, string>), code };

    if (new.target) {
      Object.keys(bodyNormalised).forEach((key) => {
        (this as Dictionary)[key] = (bodyNormalised as Dictionary)[key];
      });
      return this;
    }

    return bodyNormalised;
  }
  ErrorConstructor.code = code;
  ErrorConstructor.is = (err: unknown): err is BaseError<TCode, TBody> => {
    const baseError = err as BaseError<TCode, TBody>;
    return baseError && baseError.code === code;
  };

  Object.defineProperty(ErrorConstructor, 'name', {
    value: 'Foo',
    writable: false
  });

  return ErrorConstructor as BaseErrorClass<TCode, TArgs, TBody>;
}
