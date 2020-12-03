exports.run = async function(Data) {
  //var mysql = require('mysql2/promise');
  var mysql = require("mysql");
  var login = {
    host: "HHERE",
    user: "UHERE",
    password: "PWHERE",
    database: "DBNHERE",
  }
  //var con = await mysql.createConnection(login);
  var con = mysql.createConnection(login);
  Data.Connection = con;
  setInterval(function() {
    //con.connect();
  }, 1000 * 10);
  console.log("Connected");
  Data.VerifyLinkDiscord = async function(DiscordId) {
    //var [rows] = await con.execute("SELECT * FROM `Accounts` WHERE DiscordId= ?",[DiscordId.toString()]);
    var rows = await new Promise(function(respond) {
      con.query("SELECT SQL_NO_CACHE * FROM `Accounts` WHERE DiscordId=?", [DiscordId.toString()], function(e, r, f) {
        if(e) {console.log(e); r=[];}
        respond(r);
      })
    });
    if (rows.length == 1)
      return true;
    else return false;
  }
  Data.VerifyLink_Game = async function(_GameId) {
    //con.connect();
    //var [rows] = await con.execute("SELECT * FROM `Accounts` WHERE _GameId= ?",[_GameId.toString()]);
    var rows = await new Promise(function(respond) {
      con.query("SELECT SQL_NO_CACHE * FROM `Accounts` WHERE _GameId= ?",[_GameId.toString()], function(e, r, f) {
        if(e) {console.log(e); r=[];}
        respond(r);
      })
    });
    if (rows.length == 1)
      return true;
    else return false;
  }
  Data.AddVerification = async function(DiscordId, _GameId) {
    //await con.execute("INSERT INTO `Accounts` (Id, DiscordId, _GameId) VALUES(null,?,?)",[DiscordId.toString(),_GameId.toString()]);
    await new Promise(function(respond) {
      con.query("INSERT INTO `Accounts` (Id, DiscordId, _GameId) VALUES(null,?,?)",[DiscordId.toString(),_GameId.toString()], function(e, r, f) {
        if(e) {console.log(e); r=[];}
        //respond(r);
      })
    });
  }
  Data.Unlink = async function(DiscordId, _GameId) {
    await new Promise(function(respond) {
      con.query("DELETE FROM `Accounts` WHERE DiscordId = ? OR _GameId = ?", [DiscordId.toString(),_GameId.toString()], function(e, r, f) {
        if(e) {console.log("Unlink: " + e); r=[];}
        respond(r);
      })
    });
    //await con.execute("DELETE FROM `Accounts` WHERE DiscordId = ? OR _GameId = ?", [DiscordId.toString(),_GameId.toString()])
  }
  Data.GetDiscordIdBy_GameId = async function(_GameId) {
    //var [rows] = await con.execute("SELECT * FROM `Accounts` WHERE _GameId = ?", [_GameId.toString()]);
    var rows = await new Promise(function(respond) {
      con.query("SELECT SQL_NO_CACHE * FROM `Accounts` WHERE _GameId = ?", [_GameId.toString()], function(e, r, f) {
        if(e) {console.log(e); r=[];}
        respond(r);
      })
    });
    return rows[0].DiscordId;
  }
  Data.Get_GameIdByDiscordId = async function(DiscordId) {
    //var [rows] = await con.execute("SELECT * FROM `Accounts` WHERE DiscordId = ?", [DiscordId.toString()]);
    var rows = await new Promise(function(respond) {
      con.query("SELECT SQL_NO_CACHE * FROM `Accounts` WHERE DiscordId = ?", [DiscordId.toString()], function(e, r, f) {
        if(e) {console.log(e); r=[];}
        respond(r);
      })
    });
    return rows[0]._GameId;
  }
}
