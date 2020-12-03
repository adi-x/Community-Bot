const F = require('../extra-functions.js');

exports.run = function(data, message, args, local) {
  var tag = args[0];
  var Now = 'sendTo';
  var toChannel = false;
  var user = false;
  if (message.mentions.channels.array().length != 0)
    toChannel = true;
  if (message.mentions.users.array().length != 0)
    user = message.mentions.users.first();
  var authorId = new String(message.author.id);
  var Target;
  var CA;
  if (user == false)
    if (toChannel == false) {
      var user = F.UserFromTag(data, tag);
      if (user == null ) {
        message.reply("The person was not found in this server");
        return;
      }
      Target = user;
    } else {
      Target = message.mentions.channels.first();
    }
  else Target = user;
  if (local == true) {
    CA = data.LocalCurrentActions;
  } else CA = data.CurrentActions;
  if (CA[authorId] == null)
    CA[authorId] = [];
  CA[authorId][Now] = [];
  CA[authorId][Now].Target = Target;
  message.reply("Now introduce your message");
  CA[authorId].Handler = exports.handle;
}

exports.handle = function(data, message, local) {
  var Now = 'sendTo';
  var authorId = new String(message.author.id);
  var CA;
  if (local == true) {
    CA = data.LocalCurrentActions
  } else CA = data.CurrentActions;
  if(CA[authorId][Now] != null)
  {
    if(message.content != "cancel")
    {
      var attachment = null;
      if (message.attachments.first() != null)
        attachment = {files: [message.attachments.first().url]};
      CA[authorId][Now].Target.send(message.content, attachment)
        .then(function() {
          message.reply("The message was sent successfully !");
        })
        .catch(function() {
          message.reply(data.COULDNT_SEND);
        });
    }
    F.log(data, Now, message, CA[authorId][Now].Target);
    CA[authorId][Now] = null;
    return true;
  }
  return false;
}
