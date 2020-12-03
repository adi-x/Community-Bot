const F = require('../extra-functions.js');

exports.run = function(data, message, args) {
  var tag = args[0];
  var Now = 'Promote';
  var user = F.UserFromTag(data, tag);
  if (user == null ) {
    message.reply("The person was not found in this server");
    return;
  }
  var authorId = new String(message.author.id);
  if (data.CurrentActions[authorId] == null)
    data.CurrentActions[authorId] = [];
  data.CurrentActions[authorId][Now] = [];
  data.CurrentActions[authorId][Now].Target = user;
  message.reply("Introduce the description of the message");
  data.CurrentActions[authorId].Handler = exports.handle;
}

exports.handle = function(data, message) {
  var authorId = new String(message.author.id);
  var Now = 'Promote', i, logId, Selected = false;
  var Messages = {
    [1] : 'Introduce the OLD RANK of the promoted person',
    [2] : 'Introduce the NEW RANK of the promoted person',
  };
  Messages.length = 2;

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
      message.reply(Messages[i]);
      return true;
    }
    else if (data.CurrentActions[authorId][Now][Messages.length + 1] == null) {
      data.CurrentActions[authorId][Now][Messages.length + 1] = message;
      var actionMsg = GenerateMessage(data, authorId);
      message.channel.send(actionMsg)
        .then(function(msg) { // Adding reactions to the message
          msg.react('❌');
          msg.react('✅');
          var item = [msg.id, authorId, // Creating a table for making a custom event
            function(MessageReact) {  // The event function for clicking Reactions to said message
              if (MessageReact.emoji == '✅') {
                Selected = true;
                data.CurrentActions[authorId][Now].Target.send(actionMsg)
                  .then(function() { // Action on click
                    message.reply("The message was sent successfully !");
                    var embed = F.MessageEmbedToRichEmbed(data, data.Logs[logId].embeds[0]);
                    embed.fields.pop();
                    embed.addField('Sent', 'Yes');
                    data.Logs[logId].edit(embed)
                      .then(() => {})
                      .catch( er => {console.error(er.stack)});
                  })
                  .catch(function(error) {
                    message.reply(data.COULDNT_SEND);
                    console.error(error.stack);
                  });
              }
              else if (MessageReact.emoji == '❌') {
                msg.channel.send("Cancelled");
                Selected = true;
              }
              data.CurrentActions[authorId][Now] = null;
            }];
          F.log(data, Now.toLowerCase(), actionMsg, [authorId, data.CurrentActions[authorId][Now].Target])
            .then(x => {logId = x;})
            .catch((er) => {console.error(er.stack)});
          F.ArrayAdd(data.AwaitingReactionAddEvent, item);
          setTimeout(function() {
            if (Selected == true) return;
            F.ArrayRemoveByEquality(data.AwaitingReactionAddEvent,item);
            data.CurrentActions[authorId][Now] = null;
            data.CurrentActions[authorId].Handler = null;
            message.reply("The notice expired.")
          }, 60000);
        })
        .catch(function(msg) {
          console.log("Failed to send the generated notice message");
          data.CurrentActions[authorId][Now] = null;
          data.CurrentActions[authorId].Handler = null;
        });
        return true;
    }
  }
  return false;
}

function GenerateMessage(data, authorId) {
  var embed = new data.Discord.RichEmbed()
  var info = data.CurrentActions[authorId].Promote;
  embed.setTitle("Promotion notice for " + F.NicknameFromTag(data, info.Target.tag));
  embed.setColor("#00FF00");
  embed.setDescription(info[1]);
  embed.addField("Old rank",info[2]);
  embed.addField("New rank",info[3]);
  embed.setFooter("\nFOOTER");
  return embed;
}
