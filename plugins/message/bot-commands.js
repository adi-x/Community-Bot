var F = require('../../extra-functions.js');
var Verify = require('../_Gamelink/message/verify.js');
exports.run = function(Data, message) {
  if (Data.Bot_Cmds == null || Data.Bot_Cmds.id == null || message.channel.id.toString() != Data.Bot_Cmds.id.toString() || message.author.bot || message.author.webhook)
    return;
  if (message.content.indexOf('!') === 0) {
    if (message.content.substr(1) == "getrole")
      GetRole(Data, message);
    else if (message.content.substr(1) == "updateuser")
      GetUser(Data, message);
    else if (message.content.substr(1) == "vip")
      GetVip(Data, message);
    else if (message.content.substr(1) == "update")
      Update(Data, message);
    else if (message.content.substr(1) == "unlink")
      message.reply("Please join this game: VERIF URL HERE and click \"Unlink\" and then confirm.")
  }
}

function Update(Data, message) {
  GetRole(Data, message);
  GetUser(Data, message);
  GetVip(Data, message);
}
function GetRole(Data, message) {
  var member = message.member;
  if (member == null) return;
  Data.Verify.UpdateRoles(Data, member);
  message.channel.send(Embed(Data, "Update Roles", "Your roles are now up to date!"));
}

function GetUser(Data, message) {
  var member = message.member;
  if (member == null) return;
  Data.Verify.UpdateUsername(Data, member, true);
  message.channel.send(Embed(Data, "Update User Information", "Your user's information are now up to date!"));
}

async function GetVip(Data, message) {
  var member = message.member;
  if (member == null) return;
  var answer = await Data.Verify.VipCheck(Data, member, true);
  if (answer == true)
    message.channel.send(Embed(Data, "Discord VIP Gamepass", "Access granted!"));
  else message.channel.send(Embed(Data, "Discord VIP Gamepass", "Access denied!"));
}

function Embed(Data, FieldTitle, FieldText) {
  var embed = new Data.Discord.RichEmbed();
  embed.setTitle("_DCB Verification System");
  embed.setThumbnail("IMAGEURL HERE");
  embed.setColor("#6DC3D4");
  embed.addField(FieldTitle, FieldText);
  embed.setFooter("\nCREDITS HERE.");
  return embed;
}
