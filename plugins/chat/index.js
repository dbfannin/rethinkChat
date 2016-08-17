'use strict';

var _ = require('lodash');
var rethink = require('./rethinkdb.js');
//var rooms = require('./rooms.js');
var socketio = require('./socket.js');
var messages = require('./messages.js');
var users = require('./users.js');

module.exports.register = (plugin, options, next) => {
  options = options || {};

  rethink.init(options.rethink);
  socketio.init(plugin.plugins['hapi-io'].io);



  //Dialogue
  plugin.route({
    method: 'POST',
    path: '/message/create',
    config: {
      plugins: {
        'hapi-io': 'SEND_MESSAGE'
        }
      },
      handler: messages.sendMessage
  });

  plugin.route({
    method: 'GET',
    path: '/message/queue',
    config: {
      plugins: {
        'hapi-io': 'GET_QUEUE'
        }
      },
      handler: messages.getQueue
  });

  plugin.route({
    method: 'POST',
    path: '/dialogs/close',
    config: {
      plugins: {
        'hapi-io': 'CLOSE_DIALOG'
        }
      },
      handler: messages.closeDialog
  });

  plugin.route({
    method: 'POST',
    path: '/message/dialogs',
    config: {
      plugins: {
        'hapi-io': 'GET_ACTIVE_DIALOGS'
        }
      },
      handler: messages.getActiveDialogs
  });

  plugin.route({
    method: 'POST',
    path: '/message/queue/pop',
    config: {
      plugins: {
        'hapi-io': 'POP_QUEUE'
        }
      },
      handler: messages.popQueue
  });



  //Users

  //not using socket.io. actually using http POST
  plugin.route({
    method: 'POST',
    path: '/user/login',
    config: {
      handler: users.loginUser
    }
  });
  plugin.route({
    method: 'GET',
    path: '/test',
    config: {
      handler: function(request, reply) {
        reply('success')
      }
    }
  });


  next();
};

module.exports.register.attributes = {
  pkg: require('./package.json')
};

