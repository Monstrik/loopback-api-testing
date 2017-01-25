/**
 * Created by alexander on 1/25/17.
 */

//var loopbackApiTesting = require('loopback-api-testing');
var loopbackApiTesting = require('../index');
var tests = require('./apiTestConfig.json');
var server = require('../server/server.js');
var url = 'http://localhost:3000';

loopbackApiTesting.run(tests, server, url, function(err) {
  if (err) {
    console.log(err);
  }
});
