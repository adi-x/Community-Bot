const F = require('../extra-functions.js');

exports.run = function(data, message, args) {
  var data = {
    'type': 'command',
    'value': '[\"cheater\", \"' + "x" + '\"]',
  };
  F.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Discord-Communication/write.php", data);
}
