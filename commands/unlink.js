const F = require('../extra-functions.js');
exports.run = function(data, message) {
  var Now = 'Unlink';
  var authorId = new String(message.author.id);
  if (data.CurrentActions[authorId] == null)
    data.CurrentActions[authorId] = [];
  data.CurrentActions[authorId][Now] = [];
  message.reply("Would you like to unlink using the _GameId or the DiscordId (answer with '_Game' or 'Discord')?");
  data.CurrentActions[authorId].Handler = exports.handle;
}

exports.handle = function(data, message) {
  var authorId = new String(message.author.id);
  var Now = 'Unlink', i, logId, Selected = false;
  var Messages = {
    [1] : 'Introduce the Id of the person you want to unlink.',
  };
  Messages.length = 1;

  if (data.CurrentActions[authorId][Now] != null) {
    if (message.content == "cancel") {
      data.CurrentActions[authorId][Now] = null;
      data.CurrentActions[authorId].Handler = null;
      message.reply("Successfully Cancelled");
      return true;
    }
    for (i=1;data.CurrentActions[authorId][Now][i] != null;i++);
    if(i <= Messages.length) {
      data.CurrentActions[authorId][Now][i] = message;
      if(message.content.toLowerCase() != "_Game" && message.content.toLowerCase() != "discord")
      {
        data.CurrentActions[authorId][Now] = null;
        data.CurrentActions[authorId].Handler = null;
        message.reply("Wrong input!");
        return true;
      }
      message.reply(Messages[i]);
      return true;
    }
    else if (data.CurrentActions[authorId][Now][Messages.length + 1] == null) {
      data.CurrentActions[authorId][Now][Messages.length + 1] = message;
      message.channel.send("Are you sure you want to unlink the person with the ID " + data.CurrentActions[authorId][Now][2].content + " from this server?")
        .then(function(msg) { // Adding reactions to the message
          msg.react('❌');
          msg.react('✅');
          var item = [msg.id, authorId, // Creating a table for making a custom event
            function(MessageReact) {  // The event function for clicking Reactions to said message
              if (MessageReact.emoji == '✅') {
                Selected = true;
                if(data.CurrentActions[authorId][Now][1].content.toLowerCase() == "_Game") 
                  data.Unlink(-1, data.CurrentActions[authorId][Now][2].content);
                else if(data.CurrentActions[authorId][Now][1].content.toLowerCase() == "discord")
                  data.Unlink(data.CurrentActions[authorId][Now][2].content, -1);
                msg.channel.send("Operation has been finalized. Success rate: unknown");
              }
              else if (MessageReact.emoji == '❌') {
                msg.channel.send("Cancelled");
                Selected = true;
              }
              data.CurrentActions[authorId][Now] = null;
            }];
          F.log(data, Now.toLowerCase(), null, [authorId, data.CurrentActions[authorId][Now][1].content, data.CurrentActions[authorId][Now][2].content])
            .then(x => {logId = x;})
            .catch((er) => {console.error(er.stack)});
          F.ArrayAdd(data.AwaitingReactionAddEvent, item);
          setTimeout(function() {
            if (Selected == true) return;
            F.ArrayRemoveByEquality(data.AwaitingReactionAddEvent,item);
            data.CurrentActions[authorId][Now] = null;
            data.CurrentActions[authorId].Handler = null;
            message.reply("The action expired.")
          }, 60000);
        })
        .catch(function(msg) {
          console.log("Failed to unlink: " + msg);
          data.CurrentActions[authorId][Now] = null;
          data.CurrentActions[authorId].Handler = null;
        });
        return true;
    }
  }
  return false;
}