const F = require('../extra-functions.js');

exports.run = function(data, message, args, local) {
  var tag = args[0];
  var Now = 'Suspend';
  var user = F.UserFromTag(data, tag);
  if (user == null ) {
    message.reply("The person was not found in this server");
    return;
  }
  var authorId = new String(message.author.id);
  var CA;
  if (local == true )
  {
    CA = data.LocalCurrentActions;
  } else CA = data.CurrentActions;
  if (CA[authorId] == null)
  CA[authorId] = [];
  CA[authorId][Now] = [];
  CA[authorId][Now].Target = user;
  message.reply("Introduce the description of the message");
  CA[authorId].Handler = exports.handle;
}

exports.handle = function(data, message, local) {
  var CA;
  if (local == true) {
    CA = data.LocalCurrentActions
  } else CA = data.CurrentActions;
  var authorId = new String(message.author.id);
  var Now = 'Suspend', i, logId, Selected = false;
  var Messages = {
    [1] : 'Introduce the reason of the suspension',
    [2] : 'Introduce the due date of the suspension',
  };
  Messages.length = 2;

  if (CA[authorId][Now] != null) {
    if (message.content == "cancel") {
      CA[authorId][Now] = null;
      CA[authorId].Handler = null;
      message.reply("Successfully Cancelled");
      return true;
    }
    for (i=1;CA[authorId][Now][i] != null;i++);
    if(i <= Messages.length) {
      CA[authorId][Now][i] = message;
      message.reply(Messages[i]);
      return true;
    }
    else if (CA[authorId][Now][Messages.length + 1] == null) {
      CA[authorId][Now][Messages.length + 1] = message;
      var actionMsg = GenerateMessage(data, authorId, CA);
      message.channel.send(actionMsg)
        .then(function(msg) { // Adding reactions to the message
          msg.react('❌');
          msg.react('✅');
          var item = [msg.id, authorId, // Creating a table for making a custom event
            function(MessageReact) {  // The event function for clicking Reactions to said message
              if (MessageReact.emoji == '✅') {
                Selected = true;
                CA[authorId][Now].Target.send(actionMsg)
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
              CA[authorId][Now] = null;
            }];
          F.log(data, Now.toLowerCase(), actionMsg, [authorId, CA[authorId][Now].Target])
            .then(x => {logId = x;})
            .catch((er) => {console.error(er.stack)});
          F.ArrayAdd(data.AwaitingReactionAddEvent, item);
          setTimeout(function() {
            if (Selected == true) return;
            F.ArrayRemoveByEquality(data.AwaitingReactionAddEvent,item);
            CA[authorId][Now] = null;
            CA[authorId].Handler = null;
            message.reply("The notice expired.")
          }, 60000);
        })
        .catch(function(msg) {
          console.log("Failed to send the generated notice message");
          CA[authorId][Now] = null;
          CA[authorId].Handler = null;
        });
        return true;
    }
  }
  return false;
}

function GenerateMessage(data, authorId, CA) {
  var embed = new data.Discord.RichEmbed()
  var info = CA[authorId].Suspend;
  embed.setTitle("Suspension notice for " + F.NicknameFromTag(data, info.Target.tag));
  embed.setColor("#FFBF00");
  embed.setDescription(info[1]);
  embed.addField("Suspension Reason",info[2]);
  embed.addField("Due date",info[3]);
  embed.setFooter("\nFOOTER");
  return embed;
}
