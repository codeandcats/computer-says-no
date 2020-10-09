import * as ta from 'type-assertions';

import { defineError } from '.';

describe('defineException', () => {
  it('defines an exception with the given code', () => {
    const NotFoundError = defineError('NOT_FOUND', () => 'Not found');

    expect(NotFoundError.code).toEqual('NOT_FOUND');
  });

  it('allows you to create an exception from the definition', () => {
    const NotFoundError = defineError('NOT_FOUND', () => 'Not found');
    const error = NotFoundError();

    expect(error.code).toEqual('NOT_FOUND');
    expect(error.message).toEqual('Not found');
  });

  it('allows you to create an exception from the definition using new', () => {
    const NotFoundError = defineError('NOT_FOUND', () => 'Not found');
    const error = new NotFoundError();

    expect(error.code).toEqual('NOT_FOUND');
    expect(error.message).toEqual('Not found');
  });

  it('allows you to create an exception from the definition that takes parameters', () => {
    const ValueRequiredError = defineError(
      'VALUE_REQUIRED',
      (fieldName: string, fieldDisplayName: string) => ({
        message: `${fieldDisplayName} is required`,
        fieldName,
        fieldDisplayName,
      }),
    );

    const error = ValueRequiredError('emailAddress', 'E-mail');
    expect(error.code).toEqual('VALUE_REQUIRED');
    expect(error.message).toEqual('E-mail is required');
    expect(error.fieldName).toEqual('emailAddress');
    expect(error.fieldDisplayName).toEqual('E-mail');
  });

  it('correctly identifies the type of an error', () => {
    const NotFoundError = defineError('NOT_FOUND', () => 'Not found');
    const AccessDeniedError = defineError(
      'ACCESS_DENIED',
      () => 'Access denied',
    );

    const error = AccessDeniedError();

    expect(NotFoundError.is(error)).toEqual(false);
    expect(AccessDeniedError.is(error)).toEqual(true);
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
    const UserNotFoundError = defineError(
      'USER_NOT_FOUND',
      (username: string) => ({
        message: 'User not found',
        username,
      }),
    );

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
      ta.assert<ta.Equal<typeof someUnknownError, ExpectedType>>();

      ta.assert<ta.Not<ta.Equal<typeof someUnknownError, unknown>>>();
    } else {
      ta.assert<ta.Equal<typeof someUnknownError, unknown>>();
    }
  });
});
