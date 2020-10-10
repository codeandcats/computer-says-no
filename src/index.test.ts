import * as ta from 'type-assertions';

import { defineError, isError } from '.';

describe('defineError', () => {
  it('defines an error with the given code', () => {
    const NotFoundError = defineError('NOT_FOUND');
    expect(NotFoundError.code).toEqual('NOT_FOUND');
  });

  it('allows you to create an error from the definition', () => {
    const NotFoundError = defineError('NOT_FOUND');
    const error = NotFoundError();
    expect(error.code).toEqual('NOT_FOUND');
  });

  it('allows you to create an error using new keyowrd', () => {
    const NotFoundError = defineError('NOT_FOUND');
    const error = new NotFoundError();
    expect(error.code).toEqual('NOT_FOUND');
  });

  it('allows you to define and create errors with messages', () => {
    // There's many ways to create an error with a message property
    // Note that the message property is optional, as it doesn't make a lot of sense for i18n
    const NotFoundError1 = defineError('NOT_FOUND', 'Not found');
    const NotFoundError2 = defineError('NOT_FOUND', () => 'Not found');
    const NotFoundError3 = defineError('NOT_FOUND', { message: 'Not found' });
    const NotFoundError4 = defineError('NOT_FOUND', () => ({ message: 'Not found' }));

    const performChecks = <T extends { code: string, message: string }>(error: T) => {
      expect(error.code).toEqual('NOT_FOUND');
      expect(error.message).toEqual('Not found');
    };

    performChecks(NotFoundError1());
    performChecks(new NotFoundError1());

    performChecks(NotFoundError2());
    performChecks(new NotFoundError2());

    performChecks(NotFoundError3());
    performChecks(new NotFoundError3());

    performChecks(NotFoundError4());
    performChecks(new NotFoundError4());
  });

  it('allows you to create an error from a definition that takes parameters', () => {
    const ValueRequiredError = defineError(
      'VALUE_REQUIRED',
      (fieldName: string, fieldDisplayName: string) => ({
        message: `${fieldDisplayName} is required`,
        fieldName,
        fieldDisplayName,
      })
    );

    type ExpectedType = {
      code: 'VALUE_REQUIRED',
      message: string,
      fieldName: string,
      fieldDisplayName: string
    };

    const error1 = ValueRequiredError('emailAddress', 'E-mail');
    expect(error1.code).toEqual('VALUE_REQUIRED');
    expect(error1.message).toEqual('E-mail is required');
    expect(error1.fieldName).toEqual('emailAddress');
    expect(error1.fieldDisplayName).toEqual('E-mail');
    ta.assert<ta.Equal<typeof error1, ExpectedType>>();

    // Perform same test with `new` keyword
    const error2 = new ValueRequiredError('emailAddress', 'E-mail');
    expect(error2.code).toEqual('VALUE_REQUIRED');
    expect(error2.message).toEqual('E-mail is required');
    expect(error2.fieldName).toEqual('emailAddress');
    expect(error2.fieldDisplayName).toEqual('E-mail');
    ta.assert<ta.Equal<typeof error2, ExpectedType>>();
  });

  it('correctly identifies the type of an error', () => {
    const NotFoundError = defineError('NOT_FOUND', () => 'Not found');
    const AccessDeniedError = defineError('ACCESS_DENIED', 'Access denied');
    
    const error = AccessDeniedError();
    expect(NotFoundError.is(error)).toEqual(false);
    expect(AccessDeniedError.is(error)).toEqual(true);

    // Perform test with `new` keyword
    const error2 = new NotFoundError();
    expect(NotFoundError.is(error2)).toEqual(true);
    expect(AccessDeniedError.is(error2)).toEqual(false);
  });

  it('correctly identifies the type of an error even after its been serialized and deserialized', () => {
    const NotFoundError = defineError('NOT_FOUND', () => 'Not found');
    const AccessDeniedError = defineError('ACCESS_DENIED', () => 'Access denied');

    const errorBefore = AccessDeniedError();

    expect(NotFoundError.is(errorBefore)).toEqual(false);
    expect(AccessDeniedError.is(errorBefore)).toEqual(true);

    const errorAfter = JSON.parse(JSON.stringify(errorBefore));

    expect(NotFoundError.is(errorAfter)).toEqual(false);
    expect(AccessDeniedError.is(errorAfter)).toEqual(true);
  });

  // eslint-disable-next-line jest/expect-expect
  it('correctly infers properties available on an error based on its asserted type', () => {
    const createUserNotFound = (username: string) => ({
      message: 'User not found',
      username,
    });
    const UserNotFoundError = defineError('USER_NOT_FOUND', createUserNotFound);

    const someUnknownError: unknown = undefined;

    // At this point someUnknownError of type `unknown`
    ta.assert<ta.Equal<typeof someUnknownError, unknown>>();

    if (UserNotFoundError.is(someUnknownError)) {
      // Now we know exactly what the shape of the error is
      type ExpectedType = {
        code: 'USER_NOT_FOUND';
        message: string;
        username: string;
      };
      type ActualType = typeof someUnknownError;
      ta.assert<ta.Equal<ActualType, ExpectedType>>();

      ta.assert<ta.Not<ta.Equal<typeof someUnknownError, unknown>>>();
    } else {
      ta.assert<ta.Equal<typeof someUnknownError, unknown>>();
    }
  });

  it('can handle thrown errors', () => {
    const InvalidEmailAddressError = defineError('INVALID_EMAIL_ADDRESS', (emailAddress: string) => ({
      emailAddress,
      message: `Invalid E-mail "${emailAddress}"`,
    }));

    const checkError = (error: any) => {
      expect(error).toBeDefined();
      expect(InvalidEmailAddressError.is(error)).toEqual(true);
      expect(error.code).toEqual('INVALID_EMAIL_ADDRESS');
      expect(error.emailAddress).toEqual('foo');
      expect(error.message).toEqual('Invalid E-mail "foo"');
    }

    let error1: any;
    try {
      throw InvalidEmailAddressError('foo');
    } catch (err) {
      error1 = err;
    }
    checkError(error1);

    // Perform same test with `new` keyword
    let error2: any;
    try {
      throw new InvalidEmailAddressError('foo');
    } catch (err) {
      error2 = err;
    }
    checkError(error2);
  });
});

describe('isError', () => {
  it('returns true for any error created from computer-says-no', () => {
    const NopeError = defineError('NOPE');
    // We'lll stringify and parse it as an extra test
    const error = JSON.parse(JSON.stringify(NopeError()));
    expect(isError(error)).toEqual(true);

    // Same test using `new` keyword
    const error2 = JSON.parse(JSON.stringify(new NopeError()));
    expect(isError(error2)).toEqual(true);
  });

  it('returns false for anything else', () => {
    expect(isError(true)).toEqual(false);
    expect(isError(false)).toEqual(false);
    expect(isError(Error)).toEqual(false);
    expect(isError(new Error("I'm a standard JS Error"))).toEqual(false);
  });

  it('returns whether an error of a specific type', () => {
    const FooError = defineError('FOO');
    const BarError = defineError('BAR');

    const error = JSON.parse(JSON.stringify(FooError()));
    expect(isError(error, FooError)).toEqual(true);
    expect(isError(error, BarError)).toEqual(false);

    // Same test using `new` keyword
    const error2 = JSON.parse(JSON.stringify(new FooError()));
    expect(isError(error2, FooError)).toEqual(true);
    expect(isError(error2, BarError)).toEqual(false);
  });
});
