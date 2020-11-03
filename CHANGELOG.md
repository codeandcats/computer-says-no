# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.2.0 (2020-11-03)


### ⚠ BREAKING CHANGES

* Exposes __csn__ property on error type, replaces $ property

### Features

* change error signature to __csn__ and expose in error type ([47f379a](https://github.com/codeandcats/computer-says-no/commit/47f379afbb466caa72251cc886c5d35fc3072d70))

### 0.1.1 (2020-10-18)

## 0.1.0 (2020-10-18)


### ⚠ BREAKING CHANGES

* Fields defined in error constructor will be automatically serialized and parsed
on error creation now. This means fields like Date objects will become strings, and fields
that are functions will be removed. This helps enforce the fact early on that errors should
be serializable. The types already prevented users from passing in non-serializable fields, so
this change will only effect users who are intentionally using `any` when defining error bodies
to circumvent the type system.

### Features

* error body must now be serializable ([bf476a3](https://github.com/codeandcats/computer-says-no/commit/bf476a3a95bd8b0c09113c73cd1f69be366492f4))

### 0.0.12 (2020-10-18)

### 0.0.11 (2020-10-18)

### 0.0.10 (2020-10-18)

### 0.0.9 (2020-10-18)

### 0.0.8 (2020-10-18)

### 0.0.7 (2020-10-17)

### 0.0.6 (2020-10-17)

### [0.0.5](https://github.com/codeandcats/computer-says-no/compare/v0.0.4...v0.0.5) (2020-10-13)

### [0.0.4](https://github.com/codeandcats/computer-says-no/compare/v0.0.3...v0.0.4) (2020-10-13)


### Bug Fixes

* correct spelling of error signature property ([693a218](https://github.com/codeandcats/computer-says-no/commit/693a2180a732d2f3f8e6720c3b5acead5bf48df8))

### [0.0.3](https://github.com/codeandcats/computer-says-no/compare/v0.0.2...v0.0.3) (2020-10-12)


### Bug Fixes

* update ignore files for git and npm ([dbadc7d](https://github.com/codeandcats/computer-says-no/commit/dbadc7d084707d775ea870397e1bc48f3ac5424a))

### [0.0.2](https://github.com/codeandcats/computer-says-no/compare/v0.0.1...v0.0.2) (2020-10-12)


### Bug Fixes

* generate error class name based on error code ([e55e402](https://github.com/codeandcats/computer-says-no/commit/e55e4027ae693a09f62b3704fd4bf3c8d1fc192b))

### 0.0.1 (2020-10-10)

### Features

* allow errors to be created using new keyword ([a32f819](https://github.com/codeandcats/computer-says-no/commit/a32f819a0b617de43421d46f4b27084651419db8))
* initial code commit ([5f430a5](https://github.com/codeandcats/computer-says-no/commit/5f430a594f9a5b3166c38a9abaa26ed559cd70c2))
* various improvements ([d9992d3](https://github.com/codeandcats/computer-says-no/commit/d9992d376689238f5bcae5171ad80248288723f4))
