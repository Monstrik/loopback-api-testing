/**
 * Created by alexander on 1/25/17.
 */

var loopbackApiTesting = require('loopback-api-testing');
var testsData = require('./apiTestData.json');
var server = require('../server/server.js');
var url = 'http://localhost:3000';

loopbackApiTesting.run(testsData, server, url, function(err) {
  if (err) {
    console.log(err);
  }
});




// /**
//  * Created by Alexander on 12/12/2016.
//  */
// var should = require('chai').should(),
//   supertest = require('supertest'),
//   api = supertest('http://localhost:7000/api');
//
// describe('/customers API TEST', function () {
//
//   describe('GET /customers', function () {
//
//     it('returns customers as JSON', function (done) {
//       api.get('/customers')
//       //.set('x-api-key', '123myapikey')
//         .auth('correct', 'credentials')
//         .expect(200)
//         .expect('Content-Type', /json/)
//         .end(function (err, res) {
//           if (err) return done(err);
//           res.body.should.be.instanceof(Array);
//           //res.body.should.have.property('posts').and.be.instanceof(Array);
//           done();
//         });
//     });
//   });
//
//   describe('/customers/logout', function () {
//
//     it('errors if no token on logout', function (done) {
//       api.get('/customers/logout')
//         .expect(500)
//         .expect('Content-Type', /json/)
//         .end(function (err, res) {
//           if (err) return done();
//           //res.body.should.be.instanceof(Array);
//           //res.body.should.have.property('posts').and.be.instanceof(Array);
//           //done();
//         });
//       //.set('x-api-key', '123myapikey')
//       //.auth('incorrect', 'credentials')
//        // .expect(500, done)
//     });
//
//     // it('errors if bad x-api-key header', function(done) {
//     //   api.get('/logout')
//     //     .auth('correct', 'credentials')
//     //     .expect(401)
//     //     .expect({error:"Bad or missing app identification header"}, done);
//     // });
//
//   });
//
//
// });
