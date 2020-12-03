exports.run = function(data, message, level) {
  // 1 High ranks channels
  // 2 DMs with Middle ranks
  var embed = new data.Discord.RichEmbed()
  embed.setTitle("List of commands:");
  embed.setColor("#9370DB");
  embed.addField("!help","This command, obviously. List of commands.");
  if (level >= 3) {
    embed.addField("!sendTo {TAG}","Sends a message to the _DCB user with that tag.");
    embed.addField("!fire {TAG}","Lets you complete a Fire form for that _DCB user with the corresponding tag.");
    embed.addField("!demote {TAG}","Lets you complete a Demotion form for that _DCB user with the corresponding tag.");
    embed.addField("!promote {TAG}","Lets you complete a Promotion form for that _DCB user with the corresponding tag.");
    embed.addField("!suspend {TAG}","Lets you complete a Suspension form for that _DCB user with the corresponding tag.");
    embed.addField("!warn {TAG}","Lets you complete a Warning form for that _DCB user with the corresponding tag.");
    embed.addField("!send_reminder","Sends a staff lounge ignorance reminder.");
    embed.addField("!settimer_reminder {NUMBER}","Allows you to change the time between staff lounge ignorance reminder.");
    embed.addField("!unlink","Allows you to unlink an account from _Game. PR exclusive.");
    embed.addField("cancel","You may say *cancel* while using any of the commands !sendTo, !fire, !demote, !promote, !warn and !suspend to cancel them.");
  }
  if (level >= 2)
  {
    embed.addField("!inactive","Lets you complete an inactivity formular for _DCB. Available only in DM with the bot. Say *cancel* to cancel.")
  }
  embed.setFooter("\nSpecial thanks to Adi for making all of this possible !");
  message.channel.send(embed);
}
