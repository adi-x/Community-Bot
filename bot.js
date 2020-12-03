
const Discord = require('discord.js');
var extra_f = require('./extra-functions.js');
var priv_dm = require('./private-dm.js');
var system = require('./system.js');
var fs = require('fs');
var http = require("request-promise");
var VI = require("./Verify-Interval.js");

// Create an instance of Discord that we will use to control the bot
const bot = new Discord.Client();

const token = 'TOKEN HERE';
// Setting up shared data
var Data = [];
Data.Client = bot;
Data.Discord = Discord;
Data.Logs = [];
Data.COULDNT_SEND = 'The user\'s permissions prevent the bot from sending messages to this person.';
var AwaitingReactionAddEvent = [];
Data.AwaitingReactionAddEvent = AwaitingReactionAddEvent;
Data.CurrentActions = [];
Data.LocalCurrentActions = [];
Data.Plugins = [];
Data.SavedSettings = [];
Data.ReminderTime = 60;
Data.Verify = [];
Data.Verify.AwaitingApproval = [];
var SYS, EL;
bot.on('ready', async () => {
  console.log('Up and running !');
  Data._DCBGuild = extra_f.GetGuild(Data, "ID");
  Data._DCBLogs = extra_f.GetChannel(Data, "ID");
  Data._DCBInactivity = extra_f.GetChannel(Data, "ID");
  Data._DCBVerify = extra_f.GetChannel(Data, "ID");


  SYS = extra_f.GetGuild(Data, "ID");
  EL = extra_f.GetChannel(Data, "ID", SYS);

  fs.readdir('./plugins', (err, files) => {
    files.forEach(function(file) {
      if (file == "ready")
      {
        fs.readdir('./plugins/' + file, (err1, files1) => {
          files1.forEach(function(file1) {
            require('./plugins/' + file + '/' + file1).run(Data);
          });
        });
      }
      else {
        Data.Plugins[file] = [];
        fs.readdir('./plugins/' + file, (err1, files1) => {
          files1.forEach(function(file1) {
            fs.stat('./plugins/' + file + '/' + file1, (err, stats) => {
                if(stats.isFile() == true)
                  Data.Plugins[file].push(require('./plugins/' + file + '/' + file1));
            });
          });
        });
      }
    });
  });
  Data._DCBStaffLounge = await extra_f.GetChannelFromName(Data, "staff-lounge");
  Data._DCBChannel = await extra_f.GetChannelFromName(Data, "_DCB-assistant-home");
  //Reminder();
  Data.Bot_Cmds = await extra_f.GetChannelFromName(Data, "bot-commands");
});

/*cbot.create(function (err, session) {
  // session is your session name, it will either be as you set it previously, or cleverbot.io will generate one for you

  // Woo, you initialized cleverbot.io.  Insert further code here
});*/

bot.on('guildMemberAdd', async member => {
  if (member.guild != Data._DCBGuild) return;
  var Link = await Data.VerifyLinkDiscord(member.user.id);
  if (Link == true) {
    var Id = await Data.Get_GameIdByDiscordId(member.user.id);
    var Rank = await http("API URL HERE");
    member.addRole(extra_f.GetRoleByRoleName(Data, Rank));
    member.addRole(extra_f.GetRoleByRoleName(Data, "Verified"));
  } else {
    Data._DCBVerify.send("<@" + member.user.id + "> please verify in order to gain access to the rest of the channels of this server!");
  }
});

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

bot.on('message', message => {
  Data.Plugins['message'].forEach(function(func) {
    func.run(Data, message);
  });
  if(message.channel.id.toString() == "ID") {
    system.run(Data, message);
  }
/*  if (message.isMentioned(bot.user)) {
    console.log(message.cleanContent);
    const regex_m = /\<[^\b\s]+/g; // removes mentions
    const regex_w = /s^\s+|\s+$|\s+(?=\s)/g; // remove duplicate and trailing spaces
    var content = message.content.replace(regex_m,'').replace(regex_w,'').trim();
    cbot.ask(content, function(e, r) {
      message.reply(r);
      console.log(r);
    })
  }*/
  if(message.webhookId) return;
  if (message.channel.id == Data._DCBLogs.id)
    Data.Logs[message.id] = message;
  if (message.author.bot) return;
  if (message.channel.type == "dm")
    priv_dm.run(Data, message);
  if (message.channel.id != Data._DCBChannel.id && message.channel.id != Data._DCBVerify.id) return;
  if (message.channel.id == Data._DCBChannel.id &&
    Data.CurrentActions[message.author.id] &&
    Data.CurrentActions[message.author.id].Handler != null &&
    Data.CurrentActions[message.author.id].Type != "Verify" &&
    Data.CurrentActions[message.author.id].Handler(Data, message))
      return;
  if (message.channel.id == Data._DCBVerify.id &&
    Data.CurrentActions[message.author.id] &&
    Data.CurrentActions[message.author.id].Handler != null &&
    Data.CurrentActions[message.author.id].Type == "Verify" &&
    Data.CurrentActions[message.author.id].Handler(Data, message))
      return;
  if (message.content.indexOf('!') === 0 && message.channel.id == Data._DCBChannel.id) {
    if (message.content.substr(1, 7).toLowerCase() == "sendto ")
      require('./commands/sendTo.js').run(Data,message,[message.content.substr(8)]);
    else if (message.content.substr(1, 8).toLowerCase() == "suspend ")
      require('./commands/suspend.js').run(Data,message,[message.content.substr(9)]);
    else if (message.content.substr(1, 6).toLowerCase() == "report")
      requireUncached('./commands/report.js').run(Data,message);
    else if (message.content.substr(1, 7).toLowerCase() == "demote ")
      require('./commands/demote.js').run(Data,message,[message.content.substr(8)]);
    else if (message.content.substr(1, 8).toLowerCase() == "promote ")
      require('./commands/promote.js').run(Data,message,[message.content.substr(9)]);
    else if (message.content.substr(1, 5).toLowerCase() == "fire ")
      require('./commands/fire.js').run(Data,message,[message.content.substr(6)]);
    else if (message.content.substr(1, 6).toLowerCase() == "unlink")
      require('./commands/unlink.js').run(Data,message);
    else if (message.content.substr(1, 5).toLowerCase() == "warn ")
      require('./commands/warn.js').run(Data,message,[message.content.substr(6)]);
    else if (message.content.substr(1, 4).toLowerCase() == "help")
      require('./commands/help.js').run(Data,message,3);
    else if (message.content.substr(1).toLowerCase() == "send_reminder")
      GenerateAndSendMessage();
    else if (message.content.substr(1, 28).toLowerCase() == "settimer_reminder")
      {
        var n = message.content.substr(30);
        var ConvertedN = Number(n);
        if(n != null && n != "" && ConvertedN.toString() == n && ConvertedN >= 2)
        {
          message.reply("Succesfully changed the time between reminders to " + ConvertedN + " minutes.");
          Data.ReminderTime = ConvertedN;
          setTimeout(Reminder, Data.ReminderTime * 60 * 1000);
        }
        else message.reply("Invalid argument!")
      }
    else if (message.content.substr(1)== "fetch")
    {
      console.log(message.channel.fetchMessages({limit: 10}));
    }
    /*else if (message.content.substr(1,4) == 'http')
      require('./commands/http.js').run(Data,message);*/
  }
});

bot.on('messageReactionAdd', (ReactionMessage, User) => {
  for (var i=0; i<AwaitingReactionAddEvent.length; i++)
    if (AwaitingReactionAddEvent[i] != null)
    {
      if(AwaitingReactionAddEvent[i][1] != User.id && AwaitingReactionAddEvent[i][1] != 'skip') continue;
      if (ReactionMessage.message.id == AwaitingReactionAddEvent[i][0])
      {
        AwaitingReactionAddEvent[i][2](ReactionMessage, User);
        if(AwaitingReactionAddEvent[i][3] == true)
          extra_f.ArrayRemove(AwaitingReactionAddEvent, i);
        break;
      }
    }
});
//VI.SetUpRanks(Data);
setTimeout(() => {
  VI.run(Data);
}, 2000);

bot.login(token);
var CL = console.log;
function GenerateAndSendMessage()
{
  let embed = new Discord.RichEmbed()
    .setTitle("Important _DCB Reminder")
    .setAuthor("_DCB Discord Administration")
    .setColor("#FF1A1D")
    .setDescription("DESC HERE")
    .setFooter("** FOOTER MSG.")
    .addField("Consequences", "Fine note")
  Data._DCBStaffLounge.send({embed});
}
async function CheckFetchedMessages()
{
  var Messages = await Data._DCBStaffLounge.fetchMessages({limit: 20});

  var answer = Messages.find(Message => Message.author.bot == true);
  if (answer == null)
    return true;
  else return false;
}

async function Reminder(y)
{
  var x = Data.ReminderTime;
  y = y || x;
  console.log("X1");
  if(x != y) return;
  console.log("X2");
  let Available = false;
  Available = await CheckFetchedMessages();
  console.log("X3" + Available.toString());
  if(Available == true)
    GenerateAndSendMessage();
  setTimeout(() => {Reminder(x)}, Data.ReminderTime * 60 * 1000);
}
console.log = function(msg) {
  CL(msg);
  try {
    if(EL && msg.length > 0)
      EL.send(msg);
  }
  catch {

  }
  
}
