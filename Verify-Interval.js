var mysql = require("mysql");
var request = require("request");
var extra_f = require('./extra-functions.js');
var http = require('request-promise');
var Roles = [];
var GroupMembers = {};
var VerifiedMembers = {};
exports.run = async function(Data) {
  async function sleep(ms){
      return new Promise(resolve=>{
          setTimeout(resolve,ms);
      });
  }
  Data.Verify.RemoveVerifiedPerson = function(Id) {
    VerifiedMembers[Id.toString()] = null;
  };
  function BuildTable(RankId, RankName, Cursor) {
    return new Promise(function(resolve, reject) {
      if (Cursor == null) Cursor = "";
      else Cursor = "&cursor=" + Cursor;
      request("API URL" + RankId + "/users?sortOrder=Asc&limit=100" + Cursor, async (err, res, body) => {
        if (err) {
          await sleep(1000);
          await BuildTable(RankId, Cursor);
          resolve(RankName);
        }
        else {
          var Decoded = null;
          try {
            var Decoded = JSON.parse(body);
          }catch(e) {console.log("JSONPARSEERROR: " + e); }
          if (Decoded == null) {
            await sleep(1000);
            await BuildTable(RankId, Cursor);
            resolve(RankName);
          } else {
            while (!Decoded.data) await sleep(100);
            for(var i = 0; i < Decoded.data.length; i++) {
              GroupMembers[Decoded.data[i].userId.toString()] = {Username: Decoded.data[i].username, Rank: RankName};
            }
            if (Decoded.nextPageCursor != null)
              await BuildTable(RankId, RankName, Decoded.nextPageCursor);
            resolve(RankName);
          }
        }
      })
    })
  }
  async function SetUpRanks(Data) {
    Roles = [];
    request('API URL', async (err,res,body) => {
      if (err) console.log("SetUpRanks:" + err);
      var body = null
      try {
        body = await JSON.parse(body);
      } catch(e) {
        console.log("SetUpRanks2:" + e);
      }
      if (body == null) {
        await SetUpRanks(Data);
        return;
      }
      body.Roles.forEach(Role => {
        switch(Role.Rank) {
          case 4: case 5: case 6:
          case 7: Roles[Role.Name] = "Low Rank"; break;
          case 8: case 9: case 10:
          case 11: Roles[Role.Name] = "Middle Rank"; break;
          case 12: case 13: case 14:
          case 15: Roles[Role.Name] = "High Rank"; break;
          case 16: case 17: case 18:
          case 255: Roles[Role.Name] = "Super Rank"; break;
        }
      })
      Roles["Low Rank"] = true;
      Roles["Middle Rank"] = true;
      Roles["High Rank"] = true;
      Roles["Super Rank"] = true;
    });
  }
  async function GetAllMembers(Data) {
    GroupMembers.length = 0;
    var Roles = [
      {Id: 'ROLEIDHEREASINT', Name: "ROLENAMEHERE"}, 
    ];
    var LoadedSoFar = 0;
    for(var i = 0; i < Roles.length; i++)
    {
      var Role = Roles[i].Name;
      BuildTable(Roles[i].Id, Roles[i].Name)
        .then((r) => {
          LoadedSoFar++;
        });
    }
    do {
      await sleep(100);
    } while(LoadedSoFar != Roles.length);
  }
  async function GetVerifiedMembers(Data) {
    VerifiedMembers.length = 0;
    await new Promise((resolve, reject) => {
      //while(Data.Connection == null) sleep(10);
      Data.Connection.query('SELECT SQL_NO_CACHE * FROM `Accounts`',
        function(err, results) {
          if (err) {
            console.log("GETVERIF: "+ err);
            resolve();
          }
          var Dictionary = [];
          var Row;
          for(var i=0; i < results.length; i++) {
            Row = results[i];
            VerifiedMembers[Row.DiscordId] = Row._GameId;
          }
          resolve();
        }
      )
    })
  }
  Data.Verify.UpdateRoles1992 = async function(Data, member, Force) {
    // Checking whether user should receive any roles
    var Verified = await Data.VerifyLinkDiscord(member.user.id.toString());
    if (Verified == false)
      member.removeRoles(member.roles);
    else {
      // Checking which group related roles the user should have
      var Roles = []
      
    }
  }
  Data.Verify.UpdateRoles = async function(Data, member, Force) {
    var skip = false;
    await new Promise(async (respond, reject) => {
      var RolesGoneThrough = 0;
      member.roles.array().forEach(Role => {
        if (Role.name == "VP" || Role.name == "P")
          skip = true;
        RolesGoneThrough++;
      })
      while (RolesGoneThrough != member.roles.array().length) await sleep(50);
      respond();
    });
    if (Force == true) {
      var Verified = await Data.VerifyLinkDiscord(member.user.id.toString());
      if (Verified == false)
        VerifiedMembers[member.user.id.toString()] = null;
      if (Verified == true) {
        GroupMembers[member.user.id.toString()] = {}
        var r, success
        success = true;
          try {
            var r = await http("http://api._Game.com/users/" + VerifiedMembers[member.user.id.toString()]);
            success = true;
            console.log(VerifiedMembers[member.user.id.toString()]);
          }
          catch(e) { if (e.code != 404) success = false; console.log("UpdateRoles " + e +" ID =" + VerifiedMembers[member.user.id.toString()]);}
          if (success == false)
            return;
          try {
            r = JSON.parse(r);
          }
          catch(e) {console.log("UpdateRolesJSON " + e +" ID =" + VerifiedMembers[member.user.id.toString()]);}

        GroupMembers[member.user.id.toString()].Username = r.Username;
        do {
          try {
            GroupMembers[member.user.id.toString()].Rank = await http("URL API" + VerifiedMembers[member.user.id.toString()] +"&groupid=" + 0000 + "&nocache=" + Date.now());
            success = true;
          }
          catch(e) { console.log("UpdateRoles2" + e); success = false; }
        }
        while(success == false);

      }
    }
    if (VerifiedMembers[member.user.id.toString()] != null){
      var UserId = VerifiedMembers[member.user.id.toString()];
      if (GroupMembers[UserId.toString()] != null) {
        var GroupRole = GroupMembers[UserId.toString()].Rank;
        await member.addRole(extra_f.GetRoleByRoleName(Data, GroupRole)) .then(() => {}) .catch(() => {});
      }
      await member.addRole(extra_f.GetRoleByRoleName(Data, "Verified")) .then(() => {}) .catch(() => {});
      member.roles.array().forEach(Role => {
        if (skip == true) return;
        if (Roles[Role.name] == null) return;
        if (Role.name == GroupRole) return;
        if (Roles[GroupRole] == Role.name) {
           return;
         }
        member.removeRole(Role) .then(() => {}) .catch(() => {});
      })
      await member.addRole(extra_f.GetRoleByRoleName(Data, Roles[GroupRole])) .then(() => {}) .catch(() => {});
    } else {
      if (member.user.bot == true) return;
      member.roles.array().forEach(Role => {
        member.removeRole(Role) .then(() => {}) .catch((e) => {console.log("UpdateRoles10 " + member + "e")});
      })
    }
  }
  Data.Verify.UpdateUsername = async function(Data, member, force) {
    var DiscordId = member.user.id.toString();
    if (VerifiedMembers[DiscordId] == null) return;
    var _GameId = VerifiedMembers[DiscordId].toString();
    if (GroupMembers[_GameId] == null) await sleep(100);
    var Username = null;
    if (GroupMembers[_GameId] != null && force != true) {
      Username = GroupMembers[_GameId].Username;
    } else {
      request('https://api._Game.com/users/' + _GameId, async (err, res, body) => {
        try {
          if (err) {console.log(err); return;}
          var obj = await JSON.parse(body);
          Username = obj.Username;
        }
        catch(e){console.log(e);}
      });
    }
    while (Username == null) { await sleep(100); }
    if (member.nickname != Username){
      member.setNickname(Username, "Update to _Game username.") .then(() => {}) .catch((err) => {console.log("NICKNAME " + err); });
    }
  }
  Data.Verify.VipCheck = async function(Data, member) {
      var vip1, vip2, vip3;
      var x = await new Promise(async (respond,reject) => {
        var DiscordId = member.user.id.toString();
        if (VerifiedMembers[DiscordId] == null) return;
        var _GameId = VerifiedMembers[DiscordId].toString();
        request('API URL', (err, res, body) => {
          if (err) console.log("GP1: " + err);
          try {
            var obj = JSON.parse(body);
            if (obj.data != null && obj.data[0] != null && obj.data[0].id != null && obj.data[0].id.toString() == "0") {
              member.addRole(extra_f.GetRoleByRoleName(Data, "VPP")) .then(() => {}) .catch((e) => {console.log("VIP ERROR11:" + e)});
              //respond(true);
              vip1 = true;
            }
            else{ //member.removeRole(extra_f.GetRoleByRoleName(Data, "Server VIP")) .then(() => {}) .catch((e) => {console.log("VIP ERROR3:" + e);});
            vip1 = false;};
          } catch (e) {console.log("VIP ERROR21: "+ e)}
        });
        request('API URL', (err, res, body) => {
          if (err) console.log("GP2: " + err);
          try {
            var obj = JSON.parse(body);
            if (obj.data != null && obj.data[0] != null && obj.data[0].id != null && obj.data[0].id.toString() == "1") {
              member.addRole(extra_f.GetRoleByRoleName(Data, "VIE")) .then(() => {}) .catch((e) => {console.log("VIP ERROR12:" + e)});
              //respond(true);
              vip2 = true;
            }
            else{ //member.removeRole(extra_f.GetRoleByRoleName(Data, "Server VIP")) .then(() => {}) .catch((e) => {console.log("VIP ERROR3:" + e);});
            vip2 = false};
          } catch (e) {console.log("VIP ERROR22: "+ e)}
        });
        request('API URL', (err, res, body) => {
          if (err) console.log("GP3: " + err);
          try {
            var obj = JSON.parse(body);
            if (obj.data != null && obj.data[0] != null && obj.data[0].id != null && obj.data[0].id.toString() == "2") {
              member.addRole(extra_f.GetRoleByRoleName(Data, "VIPP")) .then(() => {}) .catch((e) => {console.log("VIP ERROR13:" + e)});
              vip3 = true;
            }
            else{ //member.removeRole(extra_f.GetRoleByRoleName(Data, "Server VIP")) .then(() => {}) .catch((e) => {console.log("VIP ERROR3:" + e);});
            vip3 = false};
          } catch (e) {console.log("VIP ERROR23: "+ e)}
        });
        respond(null)
    })
    return vip1 == true || vip2 == true || vip3 == true;
  }
  async function Everyone(func, v) {
    while (!Data._DCBGuild) await sleep(100);
    var LEN = Data._DCBGuild.members.length
    var Members = Data._DCBGuild.members.array();
    var Promises = [];
    Members.forEach((member) => {
      Promises.push(new Promise(async function(resolve) {
        await func(Data, member);
        resolve();
      }));
    });
    await Promise.all(Promises);
  }
  await SetUpRanks(Data);

  async function x() {
    console.log('A');
    await GetAllMembers(Data);
    console.log('B');
    await GetVerifiedMembers(Data);
    console.log('C');
    await Everyone(Data.Verify.UpdateRoles, "UpdateRoles");
    console.log('D');
  //  Data._DCBChannel.send("Roles have been updated!");
  }
  x();
  setInterval(x, 1000 * 60 * 2)
  setInterval(() => {Everyone(Data.Verify.UpdateUsername)}, 1000 * 60 * 60);
  setInterval(() => {Everyone(Data.Verify.VipCheck)}, 1000 * 60 * 60 * 2);
  await Everyone(Data.Verify.VipCheck, "VipCheck");
  await Everyone(Data.Verify.UpdateUsername, "UpdateUsername");
}
