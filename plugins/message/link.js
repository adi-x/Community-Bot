var F = require('../../extra-functions.js');
var Verify = require('../_Gamelink/message/verify.js');
exports.run = function(Data, message) {
  if (message.channel.id != Data._DCBVerify.id || message.author.bot || message.author.webhook)
    return;
  if (message.content.indexOf('!') === 0) {
    if (message.content.substr(1) == "verify")
      Verify.run(Data, message);
  }
}
