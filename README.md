<p align="center">
  <a href="https://www.youtube.com/watch?v=sX6hMhL1YsQ" target="_blank">
    <img width="500" src="./img/logo.svg" />
  </a>
</p>
<p align="center">
  Super simple type-safe and serializable error management in TypeScript & JavaScript.
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

function handleLoginButtonClick() {
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
function handleLoginButtonClick() {
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

## Contributing
Got an issue or a feature request? [Log it](https://github.com/codeandcats/computer-says-no/issues).

[Pull-requests](https://github.com/codeandcats/computer-says-no/pulls) are also welcome. 😸
