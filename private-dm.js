var F = require('./extra-functions.js');

exports.run = async function(data, message) {
  var PermissionLevel = await GetPermissionLevel(data, message);
  if (PermissionLevel != 4)
    Forward(data, message);
  else if (PermissionLevel == 4 && message.content.substr(0, 1) != '!' && (data.LocalCurrentActions[message.author.id] == null || data.LocalCurrentActions[message.author.id].Handler == null))
    Forward(data, message);
  if (PermissionLevel >= 2)
  {
    if (data.LocalCurrentActions[message.author.id] != null &&
      data.LocalCurrentActions[message.author.id].Handler != null &&
      data.LocalCurrentActions[message.author.id].Handler(data, message, true))
        return;
    if (message.content.indexOf('!') === 0) {
      if (message.content.substr(1) == "inactive")
        require('./commands/inactive.js').run(data, message, []);
      else if (message.content.substr(1) == "help")
        require('./commands/help.js').run(data, message, PermissionLevel)
    }
  }
  if (PermissionLevel == 4) {
    if (message.content.indexOf('!') === 0) {
      if (message.content.substr(1, 5) == "warn ")
        require('./commands/warn.js').run(data, message, [message.content.substr(6)], true);
      else if (message.content.substr(1, 5) == "fire ")
        require('./commands/fire.js').run(data, message, [message.content.substr(6)], true);
      else if (message.content.substr(1, 7) == "demote ")
        require('./commands/demote.js').run(data, message, [message.content.substr(8)], true);
      else if (message.content.substr(1, 7) == "sendTo ")
        require('./commands/sendTo.js').run(data, message, [message.content.substr(8)], true);
      else if (message.content.substr(1, 8) == "restore ")
        require('./commands/restore.js').run(data, message, [message.content.substr(9)], true);
      else if (message.content.substr(1, 8) == "suspend ")
        require('./commands/suspend.js').run(data, message, [message.content.substr(9)], true);
    
      }
  }
}
function Forward(data, message) {
  var embed = new data.Discord.RichEmbed();
  embed.setColor("#124c66");
  embed.setDescription("<@" + message.author.id + ">: " + message);

  data._DCBChannel.send(embed);
}
function GetPermissionLevel(data, message) {
  return new Promise((respond, reject) => {
    var GuildMember;
    data._DCBGuild.members.array().forEach(function(member) {
      if(member.user.id == message.author.id)
        GuildMember = member;
    })
    var Roles = {
      ['S Ranks'] : F.RoleByRoleName(data, "S Rank"), // 4
      ['H Ranks'] : F.RoleByRoleName(data, "H Rank"), // 3
      ['M Ranks'] : F.RoleByRoleName(data, "M Rank"), // 2
      // 1 = Everyone else in the server
      // 0 = People that are not in the server
    };
    if (GuildMember != null)
    {
      if (GuildMember.roles.array().includes(Roles['S Ranks']))
        respond(4);
      if (GuildMember.roles.array().includes(Roles['H Ranks']))
        respond(3);
      if (GuildMember.roles.array().includes(Roles['M Ranks']))
        respond(2);
      respond(1);
    }
    respond(0);
  })
}
