'use strict';

const _ = require('lodash');

var rethink = require('./rethinkdb.js');



exports.loginUser = (request, reply) => {
  var data = {
    loginID: request.payload.username,
    password: request.payload.password
  };

  rethink.getData('CSR', data, null, function (err, cursor) {
    if (err) { 
     return reply({errors: ['an error occurred while trying to find user']});
    }
    else if (!cursor) {
      return reply({errors: ['User not found']});
    }

    var user;
    cursor.each(function (err, row) {
      if (err)
        console.log(err);
      user = {
        username: row.loginID,
        id: row.id
      };
    }, () => {
      return reply(user);
    });

  });
}
;