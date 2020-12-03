const F = require('../extra-functions.js');
const Axios = require('axios').default;

async function Get(URL)
{
  var Answer = await new Promise((Resolve, Reject) =>
  {
    Axios.get(URL)
      .then((Response) => {
        //console.log(Response.data);
        Resolve(Response.data);
      })
      .catch((Error) => {
        Resolve([]);
      });
  });
  return Answer;
}

function Count(Dict, Key)
{
  if (Key == "N/A")
    return;
  if (Key in Dict)
    Dict[Key]++;
  else Dict[Key] = 1;
}
function IsCardCancelled(Card)
{
  for (Label of Card.labels)
  {
    if (Label.name == "Cancelled")
      return true;
  }
  return false;
}

exports.run = async function(data, message, args) {
  try {
    message.reply("Processing...");
    var ApiKey = 'API'
    var Token = 'TOKEN'
    var BoardId = 'BOARDID'
    var ApiUrl = 'https://api.trello.com'
    var Auth = `key=${ApiKey}&token=${Token}`
    ReqUrl=`${ApiUrl}/1/boards/${BoardId}/lists?${Auth}` 
    var Lists = await Get(ReqUrl);
    var TrainingListId = Lists.find(Element => Element.name.includes("Training Sessions")).id;
    var InterviewListId = Lists.find(Element => Element.name.includes("Interview Sessions")).id;
    var InterviewCards = await Get(`${ApiUrl}/1/lists/${InterviewListId}/cards?${Auth}`);
    //console.log(InterviewCards);
    var TrainingCards = await Get(`${ApiUrl}/1/lists/${TrainingListId}/cards?${Auth}`);
    //console.log(TrainingCards);
    var AllNames = {}
    var HostCount = {}
    var PromoterCount = {}
    var InterviewerCount = {}
    var TrainerCount = {}
    var SupervisorCount = {}
    var SpectatedCount = {}
    var Cards = TrainingCards.concat(InterviewCards);
    for (var Card of Cards)
    {
      // Extracting Host and Co-Host:
      // Using regex.
      // if (IsCardCancelled(Card) == true) continue;
      // console.log(Card)
      var Reg = /Host: (?<Host>.*) .* Co-Host: (?<CoHost>.*)/;
      var CardNameInfo = Card.name.match(Reg).groups;
      console.log(CardNameInfo);
      // Spectators / Promoter / Cafe Supervisor
      Reg1 = /Spectators\*\* -(?<Spectators>.*)\n/;
      Reg2 = /Promoter\*\* -(?<Promoter>.*)\n/;
      Reg3 = /Cafe Supervisor\*\* -(?<Supervisor>.*)\n/;
      CardDescInfo = {
        Spectators: Card.desc.match(Reg1).groups.Spectators.trim().split(', '),
        Promoter: Card.desc.match(Reg2).groups.Promoter.trim().split(', '),
        Supervisor: Card.desc.match(Reg3).groups.Supervisor.trim().split(', ')
      };
      var Message = "";
      //console.log(CardDescInfo);
      var Checklist = await Get(`${ApiUrl}/1/checklists/${Card.idChecklists[0]}?${Auth}`);
      // Participant (Trainer / Interviewer)
      var ChecklistItems = []
      var RawChecklistItems = Checklist.checkItems;
      for (var ChecklistItem of RawChecklistItems)
      {
        if (ChecklistItem.name != "N/A")
          ChecklistItems.push(ChecklistItem.name);
      }
      //console.log(ChecklistItems)
      Count(HostCount, CardNameInfo.Host.toLowerCase());
      AllNames[CardNameInfo.Host.toLowerCase()] = true;
      Count(HostCount, CardNameInfo.CoHost.toLowerCase());
      AllNames[CardNameInfo.CoHost.toLowerCase()] = true;
      for (Name of CardDescInfo.Promoter)
      {
        Count(PromoterCount, Name.toLowerCase());
        AllNames[Name.toLowerCase()] = true;
      }
      for (Name of CardDescInfo.Supervisor)
      {
        Count(SupervisorCount, Name.toLowerCase());
        AllNames[Name.toLowerCase()] = true;
      }
      for (Name of CardDescInfo.Spectators)
      {
        Count(SpectatedCount, Name.toLowerCase());
      }
      var CountList;
      if (TrainingCards.includes(Card))
        CountList = TrainerCount;
      else CountList = InterviewerCount;

      for (Name of ChecklistItems)
        Count(CountList, Name.toLowerCase());
    }
    var Aux;
    for (var Key in AllNames)
    {
      Aux = `[${Key}]: Promoter: ${PromoterCount[Key] || 0}, Interviewer: ${InterviewerCount[Key] || 0}, Trainer: ${TrainerCount[Key] || 0}, Host/CoHost: ${HostCount[Key] || 0}, Supervised: ${SupervisorCount[Key] || 0}, Spectated: ${SpectatedCount[Key] || 0}\n`
      if (Message.length + Aux.length > 2000)
      {
        message.channel.send(Message)
        Message = Aux
      }
      else Message += Aux
    }
    message.channel.send(Message)
    //console.log(Counts1)
  } 
  catch (E)
  {
    console.log(E)
  }
}

function GenerateMessage(data, authorId) {
  var embed = new data.Discord.RichEmbed()
  var info = data.CurrentActions[authorId].Suspend;
  embed.setTitle("Suspension notice for " + F.NicknameFromTag(data, info.Target.tag));
  embed.setColor("#FFBF00");
  embed.setDescription(info[1]);
  embed.addField("Suspension Reason",info[2]);
  embed.addField("Due date",info[3]);
  embed.setFooter("\nFOOTER");
  return embed;
}
