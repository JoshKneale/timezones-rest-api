# Timezone API
Timezone CRUD API

## Installation
Use the package manager [npm](https://www.npmjs.com/) to install dependencies.
```bash
npm install
```

## Testing
```bash
npm run test
```
This will run linting & unit tests.

There are also API tests included in the repo. Follow the steps below to run them (you'll need 2 terminal windows):

In terminal window 1:
```bash
npm run start:dev
```

In terminal window 2:
```bash
npm run test:api
```

The process will start on default port 8080 in terminal window 1. The tests will run in terminal 2 & hit the exposed endpoints.

NOTE: The api tests are writted in the [k6](https://k6.io/) tool syntax, meaning they can be used for load testing the application with "real life" API scenarios.

## TODOs
- [ ] Add Swagger docs