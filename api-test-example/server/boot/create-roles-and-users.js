'use strict';
var debug = require('debug')('loopback:apitestexample');

module.exports = function (app) {

  var Customer = app.models.customer;
  Customer.findOne({}, function (err, customer) {
    if (err) {
      debug('DB ERROR', err);
    } else {

      if (!customer) {
        debug('first run init');
        createDefaultUsers();
      }
      else {
        debug('db check: OK');
      }
    }
  });

  function createDefaultUsers() {
    var Customer = app.models.customer;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    var defaultCustomer = 'yakovis@boylesoftware.com';
    var defaultCustomer1 = 'quick.feedback.help@gmail.com';
    var defaultCustomer2 = 'foo@bar.com';
    var defaultRealm = 'SUYC';
    var secondaryRealm = 'VROOM';

    debug('>>>>>>>>>>>>>>>>createDefaultUsers in ' + app.dataSources.db.name);

    var users = [];
    var roles = [{
      name: 'admin',
      users: [
        {realm: defaultRealm, email: defaultCustomer, password: defaultCustomer},
        {realm: secondaryRealm, email: defaultCustomer, password: defaultCustomer},
      ]
    }, {
      name: 'editor',
      users: [
        {realm: defaultRealm, email: defaultCustomer1, password: defaultCustomer1},
        {realm: secondaryRealm, email: defaultCustomer1, password: defaultCustomer1}
      ]
    }, {
      name: 'users',
      users: [
        {realm: defaultRealm, email: defaultCustomer2, password: defaultCustomer2},
        {realm: secondaryRealm, email: defaultCustomer2, password: defaultCustomer2}
      ]
    }];

    app.models.Role.destroyAll(function (err, info) {
      if (err) {
        debug('ERROR>>  Role.destroyAll()');
      } else {
        debug('SUCCESS>> Role.destroyAll()  info.count:' + info.count);
      }
    });


    roles.forEach(function (role) {
      Role.findOrCreate(
        {where: {name: role.name}}, // find
        {name: role.name}, // create
        function (err, createdRole, created) {

          if (!created && err) {
            debug('error running findOrCreate(' + role.name + ')');
          }
          else {
            if (created) {
              debug('created role', createdRole.name);
            } else {
              debug('found role', createdRole.name);
            }

            role.users.forEach(function (roleUser) {
              Customer.findOrCreate(
                {where: {realm: roleUser.realm, email: roleUser.email}}, // find
                roleUser, // create
                function (err, createdUser, created) {

                  if (createdUser != null) {
                    debug('Found Or Created user', createdUser.email, createdUser.realm);
                    createdRole.principals.create({
                      principalType: RoleMapping.USER,
                      principalId: createdUser.id
                    }, function (err, rolePrincipal) {
                      if (err) {
                        debug('error creating rolePrincipal', err);
                      } else {
                        debug('Created rolePrincipal');

                      }
                      users.push(createdUser);
                    });

                  } else {
                    if (err) {
                      debug('ERR: Found Or Created user' + err.message);
                    }
                  }
                });
            });
          }
        });
    });
    return users;
  }
};
