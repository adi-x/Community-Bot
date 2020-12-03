var cache = [];
var crypto = require("crypto");
var http = require("request-promise");
var extra = require("../../../extra-functions.js");
exports.run = async function(Data, message)
{
  var answer = await Data.VerifyLinkDiscord(message.author.id);
  if(answer == false)
  {
    message.channel.send(Embed(Data, "Step 1", "Please enter your username."));
    if (Data.CurrentActions[message.author.id] == null)
      Data.CurrentActions[message.author.id] = [];
    Data.CurrentActions[message.author.id].Handler = exports.handle;
    Data.CurrentActions[message.author.id].Now = 1;
    Data.CurrentActions[message.author.id].Type = "Verify";
  }
  else message.channel.send(Embed(Data,"Error!", "You are already verified!"));
}

exports.handle = async function(Data, message) {
  if (Data.CurrentActions[message.author.id].Now == 1)
  {
    var r = await http("API URL" + message.content + "&nocache=" + Date.now());
    r = JSON.parse(r);
    if (r.success != null && r.success == false) {
      message.channel.send(Embed(Data, "Error!", "Invalid username"));
      Data.CurrentActions[message.author.id] = [];
      return true;
    }
    var userId = r.Id;
    if (Data.VerifyLink_Game(userId) == false)
      message.channel.send(Embed(Data, "Error!", "That _Game account is already linked to a discord account."))
    else {
      Data.Verify.AwaitingApproval[userId.toString()] = message.author.id;
      extra.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Verify/Add-To-Waiting-List.php", {'UserId': userId, 'Tag': message.author.tag, 'Confirmed': false});
      message.channel.send(Embed(Data, "Step 2", "Please join this game: URL and confirm your account."));
      Data.CurrentActions[message.author.id] = [];
    }
  }
  return true;
}

exports.Confirm = async function(Data, DiscordId, _GameId) {
  var r = await http("http://api._Game.com/users/" + _GameId);
  r = JSON.parse(r);
  Data._DCBVerify.send(Embed(Data, "Confirmation", "We have succesfully linked the Discord account with the tag " + extra.UserFromUserId(Data, DiscordId).tag + " with the _Game account " + r.Username + "! It might take up to 3 minutes to receive your roles, please be patient !"));
  var member = extra.MemberFromUserId(Data, DiscordId);
  Data.Verify.UpdateRoles(Data, member, true);
  Data.Verify.UpdateUsername(Data, member);
  Data.Verify.VipCheck(Data, member);
}

function Embed(Data, FieldTitle, FieldText) {
  var embed = new Data.Discord.RichEmbed();
  embed.setTitle("_DCB Verification System");
  embed.setColor("#6DC3D4");
  embed.addField(FieldTitle, FieldText);
  embed.setFooter("\nCREDITS HERE.");
  return embed;
}
