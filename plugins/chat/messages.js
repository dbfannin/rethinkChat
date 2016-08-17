'use strict';

const _ = require('lodash');
const async = require('async');
var rethink = require('./rethinkdb.js');

const DIALOG_TABLE = 'Dialogue';
const MESSAGES_TABLE = 'MessagesDialogue';

var createDialog = (applicantId, callback) => {
  let dialogueData = {
    applicantId: applicantId,
    active: 1,
    createdAt: new Date(),
    csrId: null
  };

  rethink.writeToTable(DIALOG_TABLE, dialogueData, (err, result) => {
    if (err) return console.log(err);

    callback(result);
  });
};

exports.sendMessage = (request, reply) => {
  var writeMessage = (result) => {

    let dialogId = result ? result.generated_keys[0] : request.payload.dialogId;
    let data = {
      sender: request.payload.userId,
      dialogueId: dialogId,
      createdAt: new Date(),
      message: request.payload.message
    };

    rethink.writeToTable(MESSAGES_TABLE, data, (err, result) => {
      reply(result);
    });
  };


  if (request.payload.dialogId) {
    writeMessage();
  } else {
    createDialog(request.payload.userId, writeMessage);
  }
};


var getQueue = (callback) => {
  getDialogs(null, callback);
};

var getDialogs = (csrId, callback) => {
  var filter = {
    csrId: csrId,
    active: 1
  };

  var sort = "createdAt";

  rethink.getData(DIALOG_TABLE, filter, sort, (err, cursor) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    cursor.toArray().then(results => callback(null, results));
  });
};


var getAllMessages = (dialogId, callback) => {
  var filter = {
    dialogueId: dialogId
  };

  var sort = "createdAt";

  rethink.getData(MESSAGES_TABLE, filter, sort, (err, cursor) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    cursor.toArray().then(results => callback(null, results));
  });
};
exports.popQueue = (request, reply) => {

  //get the first dialog without
  //update the dialogue table
  //return allMessages

  getQueue((err, dialogs) => {
    if (err) {
      console.error(err);
      return reply({errors: ['an error occurred while trying to find dialogs']});
    }


    rethink.update(DIALOG_TABLE, dialogs[0].id, {csrId: request.payload.userId}, () => {
      getAllMessages(dialogs[0].id, (err, messages) => {
        if (err) {
          console.error(err);
          return reply({errors: ['an error occurred while trying to find dialogs']});
        }
        dialogs[0].messages = messages;
        dialogs[0].csrId = request.payload.userId;
        reply(dialogs[0]);
      })
    });
  });


};

exports.getQueue = (request, reply) => {
  getQueue((err, dialogs) => {
    if (err) {
      console.error(err);
      return reply({errors: ['an error occurred while trying to find dialogs']});
    }

    reply({dialogs: dialogs});
  });
};

exports.getActiveDialogs = (request, reply) => {
  getDialogs(request.payload.userId, (err, dialogs) => {
    if (err) {
      console.error(err);
      return reply({errors: ['an error occurred while trying to find dialogs']});
    }

    var without = {right: ["id","active",'applicantId', 'csrId','createdAt'], left: ["id", 'dialogueId']};
    async.eachSeries(dialogs, (dialog, callback) => {
      var filter = {right: {'id': dialog.id}};
      rethink.eqJoin(MESSAGES_TABLE, DIALOG_TABLE, 'dialogueId', without, filter, 'createdAt', (err, cursor) => {
        if (err) {
          console.error(err);
          return callback();
        }

        cursor.toArray().then(messages => {
          dialog.messages = messages;
          callback();
        })
      });
    }, () => {
      reply({dialogs: dialogs});
    });

  });
};

exports.closeDialog = (request, reply) => {
  rethink.update(DIALOG_TABLE, request.payload.id, {active: 0}, () => {
    reply({id: request.payload.id});
  });

};