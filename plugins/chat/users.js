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
      console.error(err);
      return reply({errors: ['an error occurred while trying to find user']});
    }
    else if (!cursor) {
      console.error('user ' + data.loginID + ' not found');
      return reply({errors: ['User not found']});
    }

    cursor.toArray().then((results) => {
      if (err) {
        return console.log(err);
      } else if(!results.length) {
        console.error('user ' + data.loginID + ' not found');
        return reply({errors: ['User not found']});
      }


      reply({
        username: results[0].loginID,
        id: results[0].id
      });
    });
  });
}
;