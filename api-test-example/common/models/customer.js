'use strict';

var debug = require('debug')('loopback:apitestexample');


module.exports = function (Customer) {

  Customer.beforeRemote('**', function (ctx, user, next) {
    debug(ctx.methodString, 'was invoked remotely');
    next();
  });


  Customer.beforeRemote('*', function (ctx, user, next) {
    debug(ctx.methodString, 'static method was invoked remotely');
    next();
  });

  // run before any instance method eg. User.prototype.save
  Customer.beforeRemote('prototype.*', function (ctx, user, next) {
    debug(ctx.methodString, 'instance method was invoked remotely');
    next();
  });

  // prevent password hashes from being sent to clients
  Customer.afterRemote('**', function (ctx, user, next) {
    if (ctx.result) {
      if (Array.isArray(ctx.result)) {
        ctx.result.forEach(function (result) {
          delete result.password;
        });
      } else {
        delete ctx.result.password;
      }
    }
    next();
  });


  Customer.afterRemote('login', function (ctx, user, next) {
    debug('user logedin, token:', user.id);
    next();
  });

  Customer.beforeRemote('logout', function (ctx, user, next) {
    var req = ctx.req;
    if (req.accessToken) {
      debug('beforeRemote logout, userId:', req.accessToken.userId);
    }
    next();
  });


  Customer.observe('before save', function updateTimestamp(ctx, next) {
    debug('>> Customer.observe(before save) - triggered');
    next();
  });

  Customer.observe('after save', function updateTimestamp(ctx, next) {
    debug('>> Customer.observe(after save) - triggered');
    next();
  });


  Customer.validToken = function (ctx, token, cb) {
    debug('validToken invoked invoked');
    var req = ctx.req;
    if (!req.accessToken) {
      cb(401)
    }
    debug('validToken:', JSON.stringify(req.accessToken));
    cb(null, {'userId': ctx.req.accessToken.userId});
  };

  Customer.remoteMethod('validToken', {
    description: 'Return user id on valid token, or 401 on not exist token, or 404 on expired token.',
    notes: ['Return user id on valid token',
      '401 on not exist token',
      '404 on expired token'
    ],
    accepts: [
      // {arg: 'req', type: 'object', 'http': {source: 'req'}},
      // {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'ctx', type: 'object', http: {source: 'context'}},
      {arg: 'access_token', type: 'string'}
    ],
    http: {path: '/validToken', verb: 'get'},
    returns: {arg: 'userId', type: 'string'}
  });


  Customer.newPassword = function (ctx, options, cb) {
    var newErrMsg, newErr;
    if (!ctx.req.accessToken) {
      newErrMsg = "User Not Found";
      newErr = new Error(newErrMsg);
      newErr.statusCode = 401;
      return cb(newErr);
    }
    //verify passwords match
    if (!options.password || !options.confirmation ||
      options.password !== options.confirmation) {
      newErrMsg = "Passwords do not match";
      newErr = new Error(newErrMsg);
      newErr.statusCode = 400;
      return cb(newErr);
    }

    try {

      //this.findOne({where: {id: ctx.req.accessToken.userId }}, function (err, user) {
      this.findById(ctx.req.accessToken.userId, function (err, user) {
        if (err) {
          newErrMsg = "User Not Found";
          newErr = new Error(newErrMsg);
          newErr.statusCode = 404;
          return cb(newErr);
        }

        user.updateAttribute('password', options.password, function (err, user) {
          if (err) {
            return cb(err);
          }
          debug('updateAttribute-password success', user);
          cb(null, true);
        });
      });

    } catch (err) {
      error(err);
      cb(err);
    }
  };

  Customer.remoteMethod(
    'newPassword',
    {
      description: "Allows a user to change password.",
      notes: ' Send {"password":"string" ,"confirmation":"string"}',
      http: {verb: 'put'},
      accepts: [
        // {arg: 'req', type: 'object', 'http': {source: 'req'}},
        // {arg: 'res', type: 'object', 'http': {source: 'res'}},
        {arg: 'ctx', type: 'object', http: {source: 'context'}},
        {arg: 'options', type: 'object', required: true, http: {source: 'body'}}
      ],

      returns: {arg: 'newPassword', type: 'boolean'}
    }
  );

  Customer.beforeRemote('logout', function (ctx, user, next) {
    var req = ctx.req;
    if (req.accessToken) {
      debug('beforeRemote logout, userId:', req.accessToken.userId);
    }
    next();
  });
  Customer.beforeRemote('create', function (context, user, next) {
    debug('> Customer.beforeRemote create triggered');
    //send verification email after registration here
    if (!context.req.body.realm) {
      debug('realm required');
      next(new Error('realm required'));
    }
    else {
      next();
    }
  });


  Customer.afterRemote('create', function (context, user, next) {
    debug('> Customer.afterRemote create triggered');
    //send verification email after registration if needed
    next();
  });


  Customer.afterRemoteError('create', function (context, next) {
    debug('afterRemoteError triggered context.error.message=', context.error);
    delete context.error.stack;
    next(context.error);
  });


  Customer.beforeRemote('resetPassword', function (context, user, next) {
    debug('> Customer.beforeRemote resetPassword triggered');
    var req = context.req;


    // Params Validation
    var newErrMsg, newErr;
    //realm
    var realm = req.body.realm;
    if (!realm) {
      newErrMsg = "realm needed";
      newErr = new Error(newErrMsg);
      newErr.statusCode = 400; //newErr.code = 'JOPA';
      return next(newErr);
    }
    debug('beforeRemote resetPassword realm:', realm);
    //
    var resetPasswordURL = req.body.resetPasswordURL;
    if (!resetPasswordURL) {
      return next(new Error('resetPasswordURL needed'));
    }
    debug('beforeRemote resetPassword resetPasswordURL:', resetPasswordURL);
    var template = req.body.template;
    if (!template) {
      return next(new Error('template needed'));
    }
    debug('beforeRemote resetPassword template:', template);
    next();
  });

  Customer.afterRemoteError('resetPassword', function (context, next) {
    debug('> Customer.afterRemoteError resetPassword triggered');
    delete context.error.stack;
    next();
  });


  Customer.on('resetPasswordRequest', function (info) {
    debug('on resetPasswordRequest was invoked:', JSON.stringify(info));


    var realm = info.options.realm;
    var resetPasswordURL = info.options.resetPasswordURL;
    var template = info.options.template;
    debug('resetPasswordRequest realm:', realm);
    debug('resetPasswordURL:', resetPasswordURL);
    debug('info.accessToken.id:', info.accessToken.id);

    // var link = '<a href="' + resetPasswordURL + '?access_token=' +
    //   info.accessToken.id + '">Set Password</a>';
    // Customer.app.models.Email.send({
    //     to: info.email,
    //     //from: 'auth-service@a.com',
    //     //subject: 'Password reset',
    //     template: {
    //       name: template,
    //       content: [{
    //         'name': "link",
    //         'content': link
    //       }]
    //     }
    //   },
    //   function (err, result) {
    //     if (err) return debug('error sending password reset email', err);
    //     return debug('password reset email sent:', result);
    //   });
  });

  Customer.longRunning = function (delay, cb) {
    setTimeout(function () {
      cb(null, delay);
    }, delay)
  };

  Customer.remoteMethod(
    'longRunning',
    {
      http: {verb: 'get'},
      accepts: {arg: 'delay', type: 'number', required: true, default: 0, description: 'in ms'},
      accepts: {arg: 'delay', type: 'number', required: true, default: 0, description: 'in ms'},
      returns: {arg: 'finishedIn', type: 'number'}
    }
  );
};
