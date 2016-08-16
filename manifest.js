'use strict';
const nconf = require('nconf');
const path = require('path');
const fs = require('fs');

const httpsConfig = {
  port: 3000,
  key: fs.readFileSync('resources/key.pem'),
  cert: fs.readFileSync('resources/cert.pem')
};

var manifest = {
  connections: [
/*
    {
      port: nconf.get('port'),
      routes: {
        files: {
          relativeTo: path.join(__dirname, 'server')
        },
        security: {
          xframe: true
        }
      }
    },
*/
    {
      port: nconf.get('https-port'),
      routes: {
        files: {
          relativeTo: path.join(__dirname, 'server')
        },
        security: {
          xframe: true
        }
      },
      tls: {
        key: httpsConfig.key,
        cert: httpsConfig.cert
      }
    }
  ],
  registrations: [
    {plugin: {
      register: 'hapi-io',
      options: {
        socketio: {key:httpsConfig.key,cert:httpsConfig.cert}
      }
    }},
    {
      plugin: {
        register: "./plugins/chat/index.js",
        options : {
          rethink: {
            host: nconf.get('rethinkDB-host'),
            port: nconf.get('rethinkDB-port'),
            db: nconf.get('rethinkDB-name'),
          }
        }
      },
      options: {
        routes: {
          prefix: '/chat'
        }
      }
    }
  ]
};

module.exports = manifest;