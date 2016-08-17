'use strict';

var rethink = require('./rethinkdb.js');

exports.createMessage = function (request, next) {

  var writeMessage = function () {
    var data = {
      author: request.data.author,
      message: request.data.message,
      room: request.data.room,
      time: rethink.now()
    };

    rethink.writeToTable('message', data, function (err) {
      if (err)
        console.log(err);
    });
  };

  if (request.data.dialogueId) {
    writeMessage();
  } else {
    let dialogueData = {};
    rethink.writeToTable('dialog', dialogueData, function (err) {
      if (err) return console.log(err);

      writeMessage();
    });
  }

  next();
};

exports.getQueue = function (request, reply) {
  var filter = {
    csrId: "",
    //active: 1
  };
  var sort = "createdDate";
  rethink.getData('Dialogue', filter, sort, function (err, cursor) {
    if (err) {
      console.error(err);
      return reply({errors: ['an error occurred while trying to find dialogs']});
    }
    else if (!cursor) {
    }

    cursor.toArray().then((results) => {
      if (!results.length) {
        return reply({dialogs: []});
      }

      reply({dialogs: results});
    });

  });
};