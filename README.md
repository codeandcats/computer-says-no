<p align="center">
  <a href="https://www.youtube.com/watch?v=sX6hMhL1YsQ" target="_blank">
    <img width="500" src="./img/logo.svg" />
  </a>
</p>
<p align="center">
  Super simple type-safe and serializable error management in TypeScript & JavaScript.
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/computer-says-no"><img alt="npm" src="https://img.shields.io/npm/v/computer-says-no?color=lime-green&style=flat" alt="NPM" /></a>
  <a href="https://github.com/codeandcats/computer-says-no/actions"><img alt="GitHub Workflow Status (branch)" src="https://img.shields.io/github/workflow/status/codeandcats/computer-says-no/Build%20and%20Ship%20Release/master" alt="Build status"></a>
  <a href="https://coveralls.io/github/codeandcats/computer-says-no?branch=master"><img alt="Coveralls github branch" src="https://img.shields.io/coveralls/github/codeandcats/computer-says-no/master" alt="Code coverage"></a>
</p>

## Install
```sh
npm add computer-says-no
```

```sh
yarn add computer-says-no
```

## Features

- Easy Error definitions and type assertions
- Works for errors that have been serialized (via an API as JSON)
- i18n friendly

## Usage

Let's pretend we have a login function.

```typescript
function login(emailAddress: string, password: string) {
  ...
}
```

Before we implement it, let's define some errors this function could return.

```typescript
import { defineError } from 'computer-says-no';

const InvalidCredentialsError = defineError(
  'INVALID_CREDENTIALS',
  'Invalid E-mail and Password combination'
);

const FieldRequiredError = defineError(
  'FIELD_REQUIRED',
  (fieldName: string) => `${fieldName} is required`)
);
```

Now we can write our login function. Notice we are returning the errors rather than throwing them, but if you prefer to throw errors that's cool too!

```typescript
function login(emailAddress: string, password: string) {
  if (!emailAddress) {
    return new FieldRequiredError('Email');
  }

  if (!password) {
    return new FieldRequiredError('Password');
  }

  const userId = getMatchingUserId(emailAddress, password);
  if (!userId) {
    return new InvalidCredentialsError();
  }

  const authToken = getAuthTokenForUser(userId);
  return { authToken };
}
```

Note the return type of our login function will be (more or less):

```typescript
| { code: 'FIELD_REQUIRED', message: string }
| { code: 'INVALID_CREDENTIALS', message: string }
| { authToken: string }
```

This makes it easy to check which result we got back when we call our login function (ignore the `alert` calls, this is just an example 😛).

```typescript
import { isError } from 'computer-says-no';

function handleLoginSubmit() {
  const loginResult = login(emailAddress, password);

  if (isError(loginResult)) {
    alert(loginResult.message);
    return;
  }

  localStorage.setItem('authToken', loginResult.authToken);
  alert('Login successful');
}
```

## Checking for specific error types
We can improve our login function validation if we set focus the field that has an issue.

Let's change our `FieldRequiredError` to include the name of the field.

```typescript
const FieldRequiredError = defineError(
  'FIELD_REQUIRED',
  (fieldName: string) => ({
    message: `${fieldName} is required`,
    fieldName
  })
);
```

Now the `FieldRequiredError` will include a `fieldName` property. Let's update our login handler function.

```typescript
function handleLoginSubmit() {
  const loginResult = login(emailAddress, password);

  if (FieldRequiredError.is(loginResult)) {
    const input = document.getElementById(loginResult.fieldName);
    input.focus();
  }

  if (isError(loginResult)) {
    alert(loginResult.message);
    return;
  }

  localStorage.setItem('authToken', loginResult.authToken);
  alert('Login successful');
}
```

## But why?

Why not just create `Error` sub-classes and use the `instanceof` operator instead?

```typescript
class FieldRequiredError extends Error {
    constructor(readonly fieldName: string) {
        super(`${fieldName} is required`);
    }
}

...

function handleLoginSubmit() {
  const loginResult = login(emailAddress, password);

  if (loginResult instanceof FieldRequiredError) {
    const input = document.getElementById(loginResult.fieldName);
    input.focus();
  }

  if (loginResult instanceof Error) {
    alert(loginResult.message);
    return;
  }

  localStorage.setItem('authToken', loginResult.authToken);
  alert('Login successful');
}
```

Well, the above is pretty elegant and requires no library. But sadly it doesn't scale if you're working on a monorepo and return errors from your API that you need to check for in your client. The `instanceof` operator will stop working. 

This is where `computer-says-no` shines. Errors can be serialized to JSON and parsed back into plain old JS objects and all the type assertions will still work.

## Using with GraphQL / Rest APIs
Errors instantiated by `computer-says-no` will include a property named `csn`. This is a signature the library includes that is essential for internally asserting that an error is a `computer-says-no` error.

You don't normally need to worry about it, except that this property must be included during any serialization. For example when resolving errors in GraphQL you must be sure GraphQL knows about and includes the `csn` property on the error type it resolves.

## Contributing
Got an issue or a feature request? [Log it](https://github.com/codeandcats/computer-says-no/issues).

[Pull-requests](https://github.com/codeandcats/computer-says-no/pulls) are also welcome. 😸
