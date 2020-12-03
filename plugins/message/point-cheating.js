var F = require('../../extra-functions.js');
exports.run = function(Data, message) {
  if (message.webhookID && message.webhookID.toString() == 'WEBHOOK ID' && message.content.indexOf("This employee might be point cheating.") != -1)
  {
    var a, b, targetName;
    a = message.content.indexOf('|');
    b = message.content.indexOf('(');
    targetName = message.content.substr(a+2, b-a-2);
    message.react('❌');
    var item = [message.id, "skip", // Creating a table for making a custom event
      function(MessageReact, User) {  // The event function for clicking Reactions to said message
        if (MessageReact.emoji == '❌' && MessageReact.count > 1) {
          item[3] = true;
          var data = {
            'type': 'command',
            'value': '[\"cheater\", \"' + targetName + '\"]',
          };
          F.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Discord-Communication/write.php", data);
          F.log(Data, "cheater", MessageReact.message, [User, targetName])
        }
      }, false];
    F.ArrayAdd(Data.AwaitingReactionAddEvent, item);
  }
};
