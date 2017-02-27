/**
 * Created by alexander on 1/25/17.
 */
'use strict';

var supertest = require('supertest');
var async = require('async');


module.exports = {

    run: function (data, app, url, callback) {


        console.log('tezt=');
        if (typeof data !== 'object') {
            return callback('Failed to load test configuration from file');
        }

        var server;
        var agent = supertest.agent(url);
        var baseURL = '/';
        var loginUrl = data.config.loginUrl;
        var logOutUrl = data.config.logOutUrl;
        var requestTimeout = data.config.requestTimeout;
        console.log('requestTimeout=',requestTimeout);
        if (app) {
            before(function (done) {
                server = app.listen(done);
            });

            after(function (done) {
                server.close(done);
            });
        }

        describe('Loopback API', function () {
            async.each(data.tests, function (c, asyncCallback) {

                if (!c.hasOwnProperty('method')) {
                    callback('Test has no method specified');
                    return asyncCallback();
                }

                if (!c.hasOwnProperty('path')) {
                    callback('Test has no route specified');
                    return asyncCallback();
                }

                if (!c.hasOwnProperty('expect')) {
                    callback('Test has no expected response code specified');
                    return asyncCallback();
                }

                var hasData = (c.hasOwnProperty('withData'));
                var hasPathValues = (c.hasOwnProperty('withPathValues'));
                var isWithAuthentication = (c.hasOwnProperty('email') && c.hasOwnProperty('password') && c.hasOwnProperty('realm'));
                var authenticationDescription = (isWithAuthentication) ? 'authenticated' : 'unauthenticated';

                var description = 'should respond ' + c.expect + ' on ' + authenticationDescription + ' ' + c.method + ' requests to /' + c.path;
                var parsedMethod;
                var loginBlock;


                if (isWithAuthentication) {
                    loginBlock = function (loginCallback) {
                        agent
                            .post(baseURL + loginUrl)
                            .timeout(requestTimeout)
                            .send({email: c.email, password: c.password, realm: c.realm, ttl: '1209600000'})
                            .set('Accept', 'application/json')
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .end(function (err, authRes) {
                                if (err) {
                                    return loginCallback('Could not log in with provided credentials', null);
                                }

                                var token = authRes.body.id;
                                var currentUserId = authRes.body.userId;
                                return loginCallback(null, token, currentUserId);
                            });
                    };
                } else {
                    loginBlock = function (loginCallback) {
                        return loginCallback(null, null, null);
                    };
                }

                var logOut = function (token, logOutCallback) {
                    agent
                        .post(baseURL + logOutUrl + '?access_token=' + token)
                        .timeout(requestTimeout)
                        .set('Accept', 'application/json')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function (err) {
                            if (err) {
                                return logOutCallback('Could not log out');
                            }
                            return logOutCallback(null);
                        });
                };

                it(description, function (done) {
                    loginBlock(function (loginError, loginToken, currentUserId) {
                        if (loginError) {
                            done(loginError);
                            return asyncCallback();
                        }

                        if (requestTimeout){
                            agent.timeout(requestTimeout)
                            console.log('requestTimeout=',requestTimeout);
                        }

                        if (hasPathValues) {
                            //TODO: check path values
                            c.path = c.path + '/' + currentUserId
                        }

                        if (c.method.toUpperCase() === 'GET') {
                            parsedMethod = agent.get(baseURL + c.path);
                        } else if (c.method.toUpperCase() === 'POST') {
                            parsedMethod = agent.post(baseURL + c.path);
                        } else if (c.method.toUpperCase() === 'PUT') {
                            parsedMethod = agent.put(baseURL + c.path);
                        } else if (c.method.toUpperCase() === 'DELETE') {
                            parsedMethod = agent.delete(baseURL + c.path);
                        } else if (c.method.toUpperCase() === 'PATCH') {
                            parsedMethod = agent.patch(baseURL + c.path);
                        } else {
                            callback('Test has an unrecognized method type');
                            return asyncCallback();
                        }


                        if (loginToken) {
                            parsedMethod.query({access_token: loginToken});
                            //parsedMethod = parsedMethod.set('Authorization', loginToken);
                        }


                        if (hasData) {
                            parsedMethod = parsedMethod.send(c.withData)
                                .set('Content-Type', 'application/json');
                        }



                        parsedMethod
                            .expect(c.expect)
                            .end(function (err, res) {
                                if (err) {
                                    done(err);
                                } else {
                                    if (c.login == true) {
                                        loginToken = res.body.id;
                                    }
                                    done();
                                }
                                if (loginToken) {
                                    logOut(loginToken, function (err) {
                                        //NO OPS
                                    });
                                }

                                return asyncCallback();
                            });
                    });
                });
            });
        });
    }
};
