# Loopback 3 API Testing with 'realm' users #

This package is a simplified replacement for [loopback-testing](https://github.com/strongloop/loopback-testing), which is now considered deprecated.
It generates [Mocha](https://mochajs.org/) tests for Loopback API routes and examines their response codes.
Optimized for Loopback 3 with realm

The main difference between this package and [loopback-testing](https://github.com/strongloop/loopback-testing) is that loopback-api-testing does not require you to write any code.
Tests are specified in json format and the tests are generated automatically.

This package is not supported by, endorsed by, or associated with Strongloop or the core Loopback team.

## Installing ##

```bash
npm i https://github.com/Monstrik/loopback-api-testing.git
npm i mocha -g
```

## Example Usage ##
```bash
cd api-test-example
npm i
npm test
```

## Running the tests (for example): ##

```bash

mocha --reporter spec test

```

## Making Authenticated Requests ##

You can specify a `username` and `password` in your tests to make the request as an authenticated user.

```js
[
  {
    "method": "GET",
    "path": "Model",
    "email": "my@user.com",
    "password": "myPassword",
    "realm":"REALM1"
    "expect": 200
  }
]
```

## Making Requests with Data ##

You can send json data with a request.

```js
[
  {
    "method": "POST",
    "model": "Cars",
    "withData": {
      "color": "blue"
    },
    "expect": 200
  }
]
```
## Making Requests with query param ##

You can add userId in query with a request.

api/customers/{currentUserId}?auth...

```js
[
   {
        "method": "PATCH",
        "path": "api/customers/",
        "password": "TestUser@TestUser.com",
        "realm": "SUYC",
        "email": "TestUser@TestUser.com",
        "withPathValues": [
          "{currentUserId}"
        ],
        "withData": {
          "FirstName": "NewName2"
        },
        "expect": 200
      }
]
```