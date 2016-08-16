'use strict';

var rethink = require('./rethinkdb.js');

exports.createMessage = function (ctx, next) {

  var writeMessage = function () {
    var data = {
      author: ctx.data.author,
      message: ctx.data.message,
      room: ctx.data.room,
      time: rethink.now()
    };

    rethink.writeToTable('message', data, function (err) {
      if (err)
        console.log(err);
    });
  };

  if (ctx.data.dialogueId) {
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

exports.getQueue = function(ctx, reply) {
  var filter = {
    csrId: "",
    active: 1
  };
  var sort = "createdDate";
  rethink.getData('Dialog', filter, sort, function (err, cursor) {
    if (err) {
      console.error(err);
      return reply({errors: ['an error occurred while trying to find dialogs']});
    }
    else if (!cursor) {
      return reply({dialogs: []});
    }

    var dialogs = [];
    cursor.each(function (err, row) {
      if (err) {
        console.log(err);
      }
      dialogs.push(row);

    }, () => ctx.socket.emit("INIT_QUEUE", {dialogs:dialogs})
    );

  });
};