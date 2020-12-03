const F = require('../extra-functions.js');

exports.run = function(data, message, args, local) {
  var tag = args[0];
  var Now = 'restore';
  var authorId = new String(message.author.id);
  var CA;
  if (local == true) {
    CA = data.LocalCurrentActions;
  } else CA = data.CurrentActions;
  if (CA[authorId] == null)
    CA[authorId] = [];
  CA[authorId][Now] = [];
  CA[authorId][Now].Target = args[0];
  message.reply("Introduce the new points amount");
  CA[authorId].Handler = exports.handle;
}

exports.handle = function(data, message, local) {
  var Now = 'restore';
  var authorId = new String(message.author.id);
  var CA;
  if (local == true) {
    CA = data.LocalCurrentActions
  } else CA = data.CurrentActions;
  if(CA[authorId][Now] != null)
  {
    if(message.content != "cancel")
    {
      points = message.content
      var data = {
        'type': 'command',
        'value': '[\"restore\", \"' + CA[authorId][Now].Target + '\", \"' + points + '\"]',
      };
      F.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Discord-Communication/write.php", data)
      message.reply("A request to change points has been made!");
      //F.log(Data, "restore", MessageReact.message, [User, targetName])
    }
    CA[authorId][Now] = null;
    return true;
  }
  return false;
}