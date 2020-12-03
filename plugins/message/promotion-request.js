var F = require('../../extra-functions.js');
exports.run = function(Data, message) {
  if (message.webhookID && message.webhookID.toString() == 'WEBHOOK ID' && message.content.indexOf("Please rank this employee to his new rank.") != -1)
  {
    var a, b, targetName;
    a = 0;
    b = message.content.indexOf('(');
    targetName = message.content.substr(a, b-1);
    message.react('✅');
    var item = [message.id, "skip", // Creating a table for making a custom event
      function(MessageReact, User) {  // The event function for clicking Reactions to said message
        if (MessageReact.emoji == '✅' && MessageReact.count > 1) {
          item[3] = true;
          var data = {
            'type': 'command',
            'value': '[\"promoted\", \"' + targetName + '\"]',
          };
          F.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Discord-Communication/write.php", data);
          F.log(Data, "promotion", MessageReact.message, [User, targetName])
        }
      }, false];
    F.ArrayAdd(Data.AwaitingReactionAddEvent, item);
  }
};
