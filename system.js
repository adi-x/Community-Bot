var extra = require("./extra-functions.js");
var verify = require("./plugins/_Gamelink/message/verify.js");
var http = require('request-promise');
var fs = require('fs');
exports.run = async function(Data, message) {
  if (message.webhookID && message.webhookID.toString() == "470533901605928961") {
    var content = JSON.parse(message.content);
    if (content.Type == "Verify Confirmation") {
      if (Data.Verify.AwaitingApproval[content.Details.toString()] != null) {
        Data.AddVerification(Data.Verify.AwaitingApproval[content.Details.toString()], content.Details.toString());
        extra.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Verify/Remove-From-Waiting-List.php", {'UserId': content.Details.toString()});
        verify.Confirm(Data, Data.Verify.AwaitingApproval[content.Details.toString()], content.Details.toString());
      }
    }
    else if (content.Type == "Verification of Verification") {
      var answer = await Data.VerifyLink_Game(content.Details.toString())
      if (answer == true)
      {
        var id = await Data.GetDiscordIdBy_GameId(content.Details.toString());
        var tag = extra.UserFromUserId(Data, id).tag;
        extra.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Verify/Add-To-Waiting-List.php", {'UserId': content.Details.toString(), 'Tag': tag, 'Confirmed': true});
      }
      else {
        extra.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Verify/Add-To-Waiting-List.php", {'UserId': content.Details.toString(), 'Tag': null, 'Confirmed': false});
      }
      setTimeout(function() {
          extra.postRequest("https://adi.rsoindustries.com/_Game/_DCB/Verify/Remove-From-Waiting-List.php", {'UserId': content.Details.toString()});
      }, 10000);
    }
    else if (content.Type == "Unlink") {
      var member = extra.MemberFromUserId(Data, content.Details.toString());
      Data.Unlink("", content.Details.toString());
      Data.Verify.RemoveVerifiedPerson(member.user.id);
      Data.Verify.UpdateRoles(Data, member);
    }
  }
  else {
    if (message.content.substr(0, 9) == "!execute ") {
      var Script = message.content.substr(9);
      console.log("Running script: " + Script);
      var content = await http("https://adi.rsoindustries.com/_Game/_DCB/scripts/" + Script);
      fs.writeFile('./scripts-cache/' + Script, content, err => {
        if (err) throw err;
        require('./scripts-cache/' + Script).run(Data);
      })
    }
  }
}
