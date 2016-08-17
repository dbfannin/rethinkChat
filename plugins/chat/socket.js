'use strict';

var rethink = require('./rethinkdb.js');

exports.init = (io) => {
  exports.io = io;

  rethink.subscribeToChanges('Dialogue', {includeInitial: false}, function (err, cursor) {
    if (err) {
      return console.log(err);
    }

    console.log('Dialogue table updated');
    cursor.each((err, row) => {
      if (err) {
        return console.log(err);
      }

      if(row.old_val && row.old_val.active && !row.new_val.active) {
        io.sockets.emit("DIALOG_CLOSED", row.new_val)
      } else {
        io.sockets.emit("DIALOG_UPDATED", row.new_val)
      }
    });
  });

  rethink.subscribeToChanges('MessagesDialogue', {includeInitial: false}, function (err, cursor) {
    if (err) return console.log(err);


    cursor.each(function (err, row) {
      if (err) return console.log(err);

      io.sockets.emit("DIALOGUE:" + row.new_val.dialogueId, row.new_val);
    });
  });
};

