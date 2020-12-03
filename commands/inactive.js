const F = require('../extra-functions.js');

exports.run = function(data, message, args) {
  var Now = 'Inactive';
  if (data.LocalCurrentActions[message.author.id] == null)
    data.LocalCurrentActions[message.author.id] = [];
  data.LocalCurrentActions[message.author.id][Now] = [];
  message.channel.send("Enter the period (FORMAT: **from DD/MM/YYYY to DD/MM/YYYY**, e.g: from 05/06/2018 to 10/06/2018. Must be exact)");
  data.LocalCurrentActions[message.author.id].Handler = exports.handle;
  data.LocalCurrentActions[message.author.id].User = message.author;
}

exports.handle = function(data, message) {
  var Now = 'Inactive';
  var authorId = message.author.id;
  var Messages = {
    [1] : "Enter the reason: ",
  };
  if (data.LocalCurrentActions[authorId][Now] != null) {
    if(message.content == "cancel") {
      data.LocalCurrentActions[authorId].Handler = null;
      data.LocalCurrentActions[authorId][Now] = null;
      message.channel.send("Successfully Cancelled");
      return true;
    }
    if (data.LocalCurrentActions[authorId][Now][1] == null)
    {
      if (AnalyzeMessage(message.content) == false) {
        data.LocalCurrentActions[authorId].Handler = null;
        data.LocalCurrentActions[authorId][Now] = null;
        message.channel.send("Wrong format. Please run !inactive again and fill in a new inactivity notice.");
        return true;
      }
      data.LocalCurrentActions[authorId][Now][1] = message;
      message.channel.send(Messages[1]);
      return true;
    }
    else if (data.LocalCurrentActions[authorId][Now][2] == null)
    {
      data.LocalCurrentActions[authorId][Now][2] = message;
      data.LocalCurrentActions[authorId].Handler = null;
      var embed = GenerateMessage(data, authorId);
      data._DCBInactivity.send(embed)
        .then(function() {
          message.channel.send("The inactivity notice was successfully sent.");
        })
        .catch(function() {
          message.channel.send("The message wasn't sent");
        });
      F.log(data, Now.toLowerCase(), embed, authorId);
      data.LocalCurrentActions[authorId][Now] = null;
      return true;
    }
  }

  return false;
}

function GenerateMessage(data, authorId) {
  var embed = new data.Discord.RichEmbed()
  var info = data.LocalCurrentActions[authorId].Inactive;
  embed.setTitle("Inactivity notice for " + F.NicknameFromTag(data, data.LocalCurrentActions[authorId].User.tag));
  embed.setColor("#F9BB96");
  embed.addField("Period of time",info[1]);
  embed.addField("Reason",info[2]);
  embed.setFooter("\nFOOTER.");
  return embed;
}
function isNumber(char) {
  var nums = "0123456789"
  if (nums.indexOf(char) != -1)
    return true;
  return false;
}
function isUppercase(char) {
  var nums = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (nums.indexOf(char) != -1)
    return true;
  return false;
}
function isLowercase(char) {
  var nums = "abcdefghijklmnopqrstuvwxyz"
  if (nums.indexOf(char) != -1)
    return true;
  return false;
}

function AnalyzeMessage(m) {
  var pattern = "from DD/MM/YYYY to DD/MM/YYYY"
  for(var i=0;i<m.length;i++) {
    if (m[i] != pattern[i]) {
      if (!(isNumber(m[i]) && isUppercase(pattern[i])))
        return false;
    }
  }
  return true;
}
