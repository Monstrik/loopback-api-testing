# Loopback API Testing #

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

The test data file `./api-test-example/test/apiTestData.json`


Automated API testing for Loopback 3 with realm

```js
var loopbackApiTesting = require('loopback-api-testing');
var testsData = require('./apiTestData.json');
var server = require('../server/server.js');
var url = 'http://localhost:3000';

loopbackApiTesting.run(testsData, server, url, function(err) {
  if (err) {
    console.log(err);
  }
});

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

You can add param like model id in query with a request.

api/customers/{currentUserId}

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