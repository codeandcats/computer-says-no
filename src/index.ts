type BaseExceptionBody = { message: string } | string;

export type Exception<TCode extends string, TExceptionBody extends BaseExceptionBody> = TExceptionBody extends string
  ? { code: TCode; message: TExceptionBody }
  : TExceptionBody & { code: TCode };

export interface ExceptionConstructor<
  TCode extends string,
  TArguments extends any[],
  TExceptionBody extends BaseExceptionBody
> {
  (...args: TArguments): Exception<TCode, TExceptionBody>;
  create: (...args: TArguments) => Exception<TCode, TExceptionBody>;
  code: TCode;
  is(err: any): err is Exception<TCode, TExceptionBody>;
}

export function defineException<
  TCode extends string,
  TArguments extends any[],
  TExceptionBody extends BaseExceptionBody
>(
  code: TCode,
  create: (...args: TArguments) => TExceptionBody,
): ExceptionConstructor<TCode, TArguments, TExceptionBody> {
  const exceptionConstructor: ExceptionConstructor<TCode, TArguments, TExceptionBody> = (...args: TArguments) => {
    const innerBody = create(...args);
    const body =
      typeof innerBody === 'string' ? { message: innerBody } : (innerBody as Exclude<typeof innerBody, string>);
    const result = {
      ...body,
      code,
    } as Exception<TCode, TExceptionBody>;
    return result;
  };
  exceptionConstructor.create = exceptionConstructor;
  exceptionConstructor.code = code;
  exceptionConstructor.is = ((err: any) => err && err.code === code) as any;

  return exceptionConstructor;
}
