exports.ArrayAdd = function ArrayAdd(array,item) {
  var i=0;
  for(i=0;i<array.length;i++)
    if(array[i] == null)
      break;
  array[i] = item;
}
exports.ArrayRemove = function ArrayRemove(array,index) {
  array[index] = null;
  for(var i=index;i<array.length - 1;i++);
    array[i] = array[i+1];
}
exports.ArrayRemoveByEquality = function ArrayRemoveByEquality(array,item) {
  for(i=0;i<array.length;i++)
    if(array[i] == item)
      exports.ArrayRemove(array, i);
}
exports.GetGuild = function GetGuild(Data, GuildId) {
  var returnGuild = null;
  var brek = false;
  Data.Client.guilds.forEach(function(guild) {
    if (brek == false)
    {
      if (guild.id == GuildId) {
        returnGuild = guild;
        brek = true;
      }
    }
  })
  if (returnGuild == null) {
    console.log("not found");
  } else {
    return returnGuild;
  }
}
exports.GetChannel = function GetChannel(Data, ChannelId, Guild) {
  var returnChannel = null;
  var brek = false;
  var G;
  if (Guild == null)
    G = Data._DCBGuild;
  else G = Guild;
  G.channels.array().forEach(function(channel) {
    if (brek == false)
    {
      if (channel.id == ChannelId) {
        returnChannel = channel;
        brek = true;
      }
    }
  })
  if (returnChannel == null) {
    console.log("not found");
  } else {
    return returnChannel;
  }
}
exports.GetChannelFromName = async function GetChannelFromName(Data, ChannelName, Guild) {
  var returnChannel = null;
  var brek = false;
  var G;
  if (Guild == null)
    G = Data._DCBGuild;
  else G = Guild;
  await new Promise((resolve,reject) => {
    G.channels.array().forEach(function(channel) {
      if (brek == false)
      {
        if (channel.name == ChannelName) {
          returnChannel = channel;
          brek = true;
          resolve();
        }
      }
    })
  });
  if (returnChannel == null) {
    console.log("not found");
  } else {
    console.log("found - " + returnChannel)
    return returnChannel;
  }
}
exports.UserFromTag = function UserFromTag(data, NameAndTag) {
  var user = null;
  var brek = false;
  data._DCBGuild.members.array().forEach(function(member) {
    if(brek == false)
    {
      user = member.user;
      if (NameAndTag == user.tag)
        brek = true;
    }
  })
  if (user.tag == NameAndTag)
    return user;
  else return null;
}
exports.UserFromUserId = function UserFromUserId(data, UserId) {
  var user = null;
  var brek = false;
  var UserId = UserId.toString();
  data._DCBGuild.members.array().forEach(function(member) {
    if(brek == false)
    {
      user = member.user;
      if (UserId == (user.id).toString())
        brek = true;
    }
  })
  if ((user.id).toString() == UserId)
    return user;
  else return null;
}
exports.MemberFromUserId = function MemberFromUserId(data, UserId) {
  var user = null;
  var brek = false;
  var UserId = UserId.toString();
  data._DCBGuild.members.array().forEach(function(member) {
    if(brek == false)
    {
      user = member;
      if (UserId == (user.user.id).toString())
        brek = true;
    }
  })
  if ((user.user.id).toString() == UserId)
    return user;
  else return null;
}
exports.NicknameFromTag = function NicknameFromTag(data, NameAndTag) {
  var user = null;
  var brek = false;
  data._DCBGuild.members.array().forEach(function(member) {
    if(brek == false)
    {
      user = member.displayName;
      if (NameAndTag == member.user.tag)
        brek = true;
    }
  })
  if (brek == true)
    return user;
  else return null;
}
exports.MessageEmbedToRichEmbed = function MessageEmbedToRichEmbed(data, M) {
  var R = new data.Discord.RichEmbed()
    .setTitle(M.title)
    .setDescription(M.description)
    .setColor(M.color)
    .setImage(M.image)
    .setThumbnail(M.thumbnail)
    .setURL(M.url)
    .attachFile(M.file);
  if (M.author != null)
    R.setAuthor(M.author);
  if (M.footer != null)
    R.setFooter(M.footer);
  if (M.timestamp != null);
    R.setTimestamp(M.timestamp);
  M.fields.forEach(function(field){
    R.addField(field.name, field.value);
  })
  return R;
}
exports.log = async function log(data, command, message, extra) {
  var messages = [];
  var logId = null;
  messages.sendTo = "{USER} sent a message to {TARGET}";
  messages.fire = "{USER} created fire notice for {TARGET}";
  messages.demote = "{USER} created demotion notice for {TARGET}";
  messages.suspend = "{USER} created suspension notice for {TARGET}";
  messages.warn = "{USER} created warning notice for {TARGET}";
  messages.promote = "{USER} created promotion notice for {TARGET}";
  messages.inactive = "{USER} filled in an inactivity notice";
  messages.cheater = "{USER} cheatered {TARGET}";
  messages.restore = "{USER} restored id:{TARGET} points:{NUM}";
  var ModifiedString = messages[command];
  switch(command) {
    case 'sendTo':
      ModifiedString = ModifiedString.replace("{USER}","<@" + message.author.id + ">");
      ModifiedString = ModifiedString.replace("{TARGET}","<@" + extra.id + ">");
      await (data._DCBLogs.send(GenerateLog(data, 'sendTo', ModifiedString, message))
        .then(function(msg) {logId = msg.id;})
        .catch(function(error) {logId = 0; console.error(error.stack);}));
      break;
    case 'fire':
    case 'warn':
    case 'promote':
    case 'suspend':
    case 'demote':
      ModifiedString = ModifiedString.replace("{USER}","<@" + extra[0] + ">");
      ModifiedString = ModifiedString.replace("{TARGET}","<@" + extra[1].id + ">");
      await (data._DCBLogs.send(GenerateLog(data, 'categoryA', ModifiedString, message))
        .then(function(msg) {logId = msg.id;})
        .catch(function(error) {logId = 0; console.error(error.stack);}));
      break;
    case 'inactive':
      ModifiedString = ModifiedString.replace("{USER}","<@" + extra + ">");
      await (data._DCBLogs.send(GenerateLog(data, 'categoryB', ModifiedString, message))
        .then(function(msg) {logId = msg.id;})
        .catch(function(error) {logId = 0; console.error(error.stack);}));
      break;
    case 'cheater':
      ModifiedString = ModifiedString.replace("{USER}","<@" + extra[0].id + ">");
      ModifiedString = ModifiedString.replace("{TARGET}",extra[1]);
      await (data._DCBLogs.send(GenerateLog(data, 'categoryC', ModifiedString, message))
        .then(function(msg) {logId = msg.id;})
        .catch(function(error) {logId = 0; console.error(error.stack);}));
      break;
    case 'unlink': break;  
    default : break;
  }
  return logId;
}
function GenerateLog(data, command,a, b) {
  var embed = new data.Discord.RichEmbed()
  embed.setTitle("_DCB Assistant Log");
  embed.setColor("#ffbdbd");
  embed.setDescription(a);
  if (command == 'sendTo') {
    embed.addField("Message", "\"" + b + "\"")
  }
  else if (command == 'categoryA') {
    embed.addField('Title', b.title);
    embed.addField('Description', b.description);
    b.fields.forEach(function(field) {
      embed.addField(field.name, field.value);
    })
    embed.addField('Sent', 'No');
  }
  else if (command == 'categoryB') {
    embed.addField('Title', b.title);
    b.fields.forEach(function(field) {
      embed.addField(field.name, field.value);
    })
  }
  else if (command == 'categoryC') {
  }
  embed.setTimestamp();
  return embed;
}
exports.RoleByRoleName = function(data, name) {
  var answer;
  data._DCBGuild.roles.array().forEach(function(role) {
    if (role.name == name)
      answer = role
  })
  return answer;
}
exports.postRequest = function(website,data) {
  var port, host, path, http;
  var f;
  data = JSON.stringify(data);
  if (website.substr(0, 5) == 'https') {
    port = 443;
    f = website.substr(0,8);
    host = website.substr(8);
  } else  if (website.substr(0,5) == 'http:'){
    port = 80;
    f = website.substr(0,7);


    host = website.substr(7);
  } else return false;
  if (port == 443)
    http = require('https');
  else http = require('http');
  path = host.substr(host.indexOf('/'));
  host = host.substr(0, host.indexOf('/'));
  var post_options = {
    host: host,
    port: port,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    }
  };
  var request = require('request');
  request({
      method: 'post',
      url: website,
      form: data,
      headers: {'Content-Type': 'application/json'},
      json: true,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200)
        console.log(body);
      else if(error)
        console.error(error);
    }
  );
}
exports.GetRoleByRoleName = function(Data, RoleName) {
  var Role = null;
  var brek = false;
  Data._DCBGuild.roles.array().forEach(function(role) {
    if(brek == false)
    {
      Role = role;
      if (RoleName == Role.name)
        brek = true;
    }
  })
  if (brek == true)
    return Role;
  else return null;
}
