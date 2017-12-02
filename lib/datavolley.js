let request = require('request');
let sanitize = require("sanitize-filename");
let fs = require('fs');
let path = require('path');
let iterate = require('async-iterate');

var liveAuth = process.env.DATAVOLLEY_LIVE_API_KEY;
var listAuth = process.env.DATAVOLLEY_ADMIN_API_KEY;

function dateIsBetweenDates (startDate, endDate, date) {

    startDate = parseInt(startDate.toISOString().slice(0,10).replace(/-/g,""));
    endDate = parseInt(endDate.toISOString().slice(0,10).replace(/-/g,""));
    date = parseInt(date.toISOString().slice(0,10).replace(/-/g,""));

    //console.log(startDate, date, endDate);
    if (startDate <= date  && date <= endDate) {
        return true;
    }
    return false;
}

class MatchList {
    constructor (fedCode = 'NVBF') {
        this.service = new DataVolleyService(fedCode)
    }

    _getSeasonId () {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.service.getJson('Season?seasontype=2').then((data) => {
                var seasonId = -1;

                for (var i = 0; i < data.length; i++) {
                    if (data[i].Code == 'TEST' || data[i].Closed) {
                        continue;
                    }

                    seasonId = data[i].SeasonID;
                }

                resolve(seasonId);
            });
        });
    }

    _getSeasonCompetitions (seasonId, date) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let competitions = [];
            self.service.getJson('Competition?seasonID=' + seasonId).then((data) => {
                for (var i = 0; i < data.length; i++) {
                    if (dateIsBetweenDates(new Date(data[i].DateFrom), new Date(data[i].DateTo), date)) {
                        competitions.push(data[i].CompetitionID);
                    }
                }
                console.log(competitions);
                resolve(competitions);
            });
        });
    }


    _getCompetitionPhases (competitions, date) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let phases = [];

            iterate.each(competitions, function (value, key, done) {
                self.service.getJson('Phase?competitionID=' + value).then((data) => {
                    for (var i = 0; i < data.length; i++) {

                        if (dateIsBetweenDates(new Date(data[i].DateFrom), new Date(data[i].DateTo), date)) {
                            phases.push(data[i].PhaseID);
                        }
                        console.log(phases);
                    }
                    done(null);
                });
            }, function (err, data) {
                resolve (phases);
            });
        });
    }

    _getPhasesChampionships (phases, date) {
        let self = this;
        return new Promise(function (resolve, reject) {
            var championships = [];
            iterate.each(phases, function (value, key, done) {
                self.service.getJson('Championship?phaseID=' + value).then((data) => {
                    for (var i = 0; i < data.length; i++) {
                        if ( data[i].CompetitionPhaseID == 9) {
                            console.log(data[i]);
                        }
                        if (dateIsBetweenDates(new Date(data[i].DateFrom), new Date(data[i].DateTo), date)) {
                            championships.push(data[i].ChampionshipID);
                        }
                    }
                    done();
                });
            }, function (err, data) {
                resolve (championships);
            });
        });
    }


    _getChampionshipsLegs (championships, date) {
        let self = this;
        return new Promise(function (resolve, reject) {
            var legs = [];
            iterate.each(championships, function (value, key, done) {
                self.service.getJson('Leg?championshipID=' + value).then((data) => {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].LegID == 37) {
                            console.log(data[i]);
                        }
                        if (dateIsBetweenDates(new Date(data[i].DateFrom), new Date(data[i].DateTo), date) || data[i].LegID == 37) {
                            legs.push(data[i].LegID);
                        }
                    }
                    done();
                });
            }, function (err, none) {
                resolve(legs);
            })
        });
    }

    _getLegMatches (legs, date) {
        let self = this;
        return new Promise(function (resolve, reject) {
            var games = [];
            iterate.each(legs, function (value, key, done) {
                self.service.getJson('Match?legID=' + value).then((data) => {

                    if (data.LegID == 37) {
                        console.log(data);
                    }

                    for (var i = 0; i < data.length; i++) {
                        if (dateIsBetweenDates(new Date(data[i].MatchDateTime), new Date(data[i].MatchDateTime), date)) {
                            games.push(data[i]);
                        }
                        //legs.push(data[i].LegID);
                    }
                    done();
                });
            }, function () {
                resolve(games);
            })
        });
    }

    getCurrentMatches () {
        var self = this;

        return new Promise(function (resolve, reject) {
            var currentDate = new Date();

            // Get yesterdays matches:
            //currentDate.setDate(currentDate.getDate() -1);

            console.log(currentDate);
            self._getSeasonId()
                .then(seasonId => self._getSeasonCompetitions(seasonId, currentDate))
                .then(competitions => self._getCompetitionPhases(competitions, currentDate))
                .then(phases => self._getPhasesChampionships(phases, currentDate))
                .then(championships => self._getChampionshipsLegs(championships, currentDate))
                .then(legs => self._getLegMatches(legs, currentDate))
                .then(games => {
                    let ret = [];
                    for (var i = 0; i < games.length; i++) {
                        let gameTime = new Date(games[i].MatchDateTime);
                        let min = gameTime.getMinutes();
                        if (min < 10) {
                            min = '0' + min;
                        }
                        let time = gameTime.getHours() + ':' + min;
                        ret.push({
                            MatchID: games[i].FederationMatchID,
                            homeTeam: {
                                name: games[i].HomeTeam,
                            },
                            awayTeam: {
                                name: games[i].GuestTeam
                            },
                            time: time
                            // This is always false?
                            //sex: (games[i].MaleNotFemale) ? 'M' : 'W'
                        });
                    }

                    resolve(ret);
                });
        });
    }
}

class Match {
    constructor (fedCode, matchId) {
        this.matchId = matchId;
        this.fedCode = fedCode;
        this.service = new DataVolleyLiveService(matchId, fedCode);
        this.listService = new DataVolleyService(fedCode);
    }

    static getInstance (fedCode, matchId) {
        var key = fedCode + '--' + matchId;
        if (typeof(Match.instances[key]) == 'undefined') {
            Match.instances[key] = new Match(fedCode, matchId);
        }
        console.log(key);
        return Match.instances[key];
    }

    getGameInfo (updateOnly) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.service.getJson('MatchLiveFullInfo').then((data) => {
                if (!data) {
                    console.log('Reject at once');
                    reject('Unable to get data');
                }
//                console.log(data);
                var gameData = {
                    homeTeam: {},
                    awayTeam: {}
                };

                self.homeTeam = {
                    id: data.HID,
                    name: data.HTN
                }

                self.awayTeam = {
                    id: data.GID,
                    name: data.GTN
                }

                gameData.homeTeam.name = data.HTN;
                gameData.awayTeam.name = data.GTN;

                gameData.homeTeam.logo = self.getLogoPath(data.HTN);
                gameData.awayTeam.logo = self.getLogoPath(data.GTN);

                gameData.homeTeam.setPoints = [
                    data.S1H,
                    data.S2H,
                    data.S3H,
                    data.S4H,
                    data.S5H,
                ];

                gameData.awayTeam.setPoints = [
                    data.S1G,
                    data.S2G,
                    data.S3G,
                    data.S4G,
                    data.S5G,
                ]

                gameData.homeTeam.points = data.CHP;
                gameData.awayTeam.points = data.CGP;

                if (data.SSix) {
                    gameData.homeTeam.lineup = [];
                    gameData.awayTeam.lineup = [];

                    for (var i = 0; i<data.SSix.LUPH.length; i++) {
                        gameData.homeTeam.lineup.push(data.SSix.LUPH[i].PN);
                    }

                    for (var i = 0; i<data.SSix.LUPG.length; i++) {
                        gameData.awayTeam.lineup.push(data.SSix.LUPG[i].PN);
                    }

                }



                if (!updateOnly) {
                    self.getRoster().then((players) => {
                        gameData.homeTeam.players = players.homeTeam,
                        gameData.awayTeam.players = players.awayTeam,

                        self.listService.getJson('PlayerTeam?TeamID=' + data.HID).then ( function (players) {
                            self.listService.getJson('PlayerTeam?TeamID=' + data.GID).then ( function (players2) {
                                players = players.concat(players2);

                                for (i = 0; i < players.length; i++) {
                                    var p = players[i];

                                    var pos = '';
                                    if (p.Position == 'Opposite') {
                                        pos = 'Diagonal';
                                    }
                                    else if (p.Position == 'Wing-spiker') {
                                        pos = 'Kant';
                                    }
                                    else if (p.Position == 'Middle-Blocker') {
                                        pos = 'Midt';
                                    }
                                    else if (p.Position == 'Libero') {
                                        pos = 'Libero';
                                    }
                                    else if (p.Position == 'Setter') {
                                        pos = 'Opplegger';
                                    }

                                    var dob = new Date(p.DateOfBirth);
                                    var y = dob.getFullYear();

                                    var team = 'homeTeam';
                                    if (p.TeamID != data.HID) {
                                        team = 'awayTeam';
                                    }

                                    for (var j = 0; j < gameData[team].players.length; j++) {
                                        if (gameData[team].players[j].id == p.PersonID) {
                                            gameData[team].players[j].position = pos;
                                            gameData[team].players[j].birthyear = y;
                                            break;
                                        }
                                    }
                                }
                                resolve(gameData);
                            });
                        });

                    });
                }
                else {
                    if (data.PStatsH) {

                        gameData.homeTeam.blocks = 0;
                        gameData.homeTeam.attack = 0;
                        gameData.awayTeam.opponentErrors = 0
                        gameData.homeTeam.ace = 0;
                        gameData.homeTeam.players = [];
                        for (var i = 0; i<data.PStatsH.length; i++) {
                            // Update stats:
                            var player = {
                                name: data.PStatsH[i]['NM'] + ' ' + data.PStatsH[i]['SR'],
                                number: data.PStatsH[i]['N'],
                                ace: data.PStatsH[i]['SWin'],
                                blocks: data.PStatsH[i]['BWin'],
                                attack: data.PStatsH[i]['SpWin']
                            };

                            player.points = player.ace + player.blocks + player.attack;
                            
                            gameData.homeTeam.blocks += player.blocks;
                            gameData.homeTeam.attack += player.attack;
                            gameData.homeTeam.ace += player.ace;
                            gameData.homeTeam.players.push(player);

                            // Away team get opponent error:
                            gameData.awayTeam.opponentErrors += data.PStatsH[i]['SErr'];
                            gameData.awayTeam.opponentErrors += data.PStatsH[i]['RErr'];
                            gameData.awayTeam.opponentErrors += data.PStatsH[i]['SpErr'];
                        }

                        gameData.awayTeam.blocks = 0;
                        gameData.awayTeam.attack = 0;
                        gameData.awayTeam.ace = 0;
                        gameData.homeTeam.opponentErrors = 0;

                        gameData.awayTeam.players = [];
                        for (var i = 0; i<data.PStatsG.length; i++) {
                            // Update stats:
                            var player = {
                                name: data.PStatsG[i]['NM'] + ' ' + data.PStatsG[i]['SR'],
                                number: data.PStatsG[i]['N'],
                                ace: data.PStatsG[i]['SWin'],
                                blocks: data.PStatsG[i]['BWin'],
                                attack: data.PStatsG[i]['SpWin']
                            };

                            player.points = player.ace + player.blocks + player.attack;

                            gameData.awayTeam.blocks += player.blocks;
                            gameData.awayTeam.attack += player.attack;
                            gameData.awayTeam.ace += player.ace;
                            gameData.awayTeam.players.push(player);

                            // Away team get opponent error:
                            gameData.homeTeam.opponentErrors += data.PStatsG[i]['SErr'];
                            gameData.homeTeam.opponentErrors += data.PStatsG[i]['RErr'];
                            gameData.homeTeam.opponentErrors += data.PStatsG[i]['SpErr'];
                        }

                    }


                    resolve(gameData);
                }
            })
                .catch(function (err) {
                    console.log('Rethrow message');
                    console.log(err);
                    reject(err.Message);
                });
        })
    }

    getCurrentScore () {
        console.log('Getting current score')
        this.service.getJson('MatchInfo').then( (data) => {
           console.log('Got data');
           console.log(data);
        });
    }

    getRoster () {
        console.log('Getting roster');
        var self = this;
        return new Promise(function (resolve, reject) {
            self.service.getJson('Roster').then((data) => {
                var htPlayers = [];

                iterate.each(data.RH, function (value, key, done) {
                    var player = {
                        number: parseInt(value.N),
                        name: value.NM + ' ' + value.SR,
                        height: '',
                        position: '',
                        birthyear: '',
                        reach: '',
                        blockReach: '',
                        id: value.PID
                    }
                    htPlayers.push(player);

                    console.log('Downloading HT player image');
                    self.downloadPlayerImage('home', player.id, function (path) {
                        if (path) {
                            player.image = path;
                        }
                        done ();
                    });
                }, function () {
                    var atPlayers = [];
                    iterate.each(data.RG, function (value, key, done) {
                        var player = {
                            number: parseInt(value.N),
                            name: value.NM + ' ' + value.SR,
                            height: '',
                            position: '',
                            birthyear: '',
                            reach: '',
                            blockReach: '',
                            id: value.PID
                        }

                        console.log('Downloading AT player image');
                        self.downloadPlayerImage('away', player.id, function (path) {
                            if (path) {
                                player.image = path;
                            }
                            atPlayers.push(player);
                            done ();
                        });
                    }, function () {
                        resolve({
                            homeTeam: htPlayers,
                            awayTeam: atPlayers
                        })
                    });
                });
            });
        })
    }

    getLogoPath(team) {
        console.log('Logo' + team)
        var map = {
            'ToppVolley Norge': 'tvn',
            'Førde Volleyballklubb': 'forde',
            "NTNUI Volleyball": 'ntnui',
            'Oslo Volley': 'oslovolley',
            'Koll IL': 'koll',
            'TIF Viking': 'viking',
            'Randaberg IL': 'randaberg',
            'OSI': 'osi',
            'Stod IL': 'stod',
            'BK Tromsø': 'bktromso',
            'TEST Team A': 'ntnui',
            'TEST Team B': 'osi'
        }

        return '/graphics/logo/' + map[team] + '.svg';
    }

    downloadPlayerImage(team, playerId, callback) {
        var teamId = -1;
        var teamName = "";
        if (team == 'home') {
            teamId = this.homeTeam.id;
            teamName = this.homeTeam.name;
        }
        else {
            teamId = this.awayTeam.id;
            teamName = this.awayTeam.name;
        }

        var safeClubName = sanitize(teamName);
        var clubDir = path.dirname(__dirname) + '/data/' + safeClubName;
        var playersDir = clubDir + '/' + '/players/';
        var fileName = playersDir + '/' +  playerId + '.jpg';

        var webUrl = '/graphics/'+safeClubName.replace(/ /g, "%20")+'/players/'+playerId+'/image';

        if (!fs.existsSync(fileName)) {
            if (!fs.existsSync(clubDir)) {
                console.log('Creating ' + clubDir)
                fs.mkdirSync(clubDir);
            }
            if (!fs.existsSync(playersDir)) {
                console.log('Creating ' + playersDir)
                fs.mkdirSync(playersDir);
            }

            var imageUrl = 'https://dataprojectimagestorage.blob.core.windows.net:443/nvbf/TeamPlayer/TeamPlayer_'+teamId+'_'+playerId+'.jpg';

            console.log('Downloading file ' + imageUrl);

            downloadFile(
                imageUrl,
                fileName,
                function (err) {
                    if (err) {
                        callback(null);
                    }
                    else {

                        callback(webUrl);
                    }
                }
            );
        }
        else {
            // File exists:
            callback(webUrl);
        }


    }

}

Match.instances = {};


class DataVolleyLiveService {
    constructor(matchId, fedCode = 'NVBF') {
        this.matchId = matchId;
        this.fedCode = fedCode;
    }

    getJson(method) {
        var fedCode = this.fedCode;
        var matchId = this.matchId;
        return new Promise(function (resolve, reject) {
            var url = 'https://dataprojectserviceswebapilive.azurewebsites.net/api/v1/' + fedCode + '/';
            url += method;
            url += '/FedMatchID/';
            url += matchId;

            console.log(url);
            request({
                method: 'GET',
                url: url,
                auth: {
                    bearer: liveAuth
                }
            }, function (error, response, body) {
                console.log(error);
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }
                else {
                    console.log(body);
                    reject('Wrong API error code');
                }
            }, function (er1, er2) {
                console.log(er1, er2);
                reject(er1);
            });
        })
    }
}

class DataVolleyService {
    constructor(matchId, fedCode = 'NVBF') {
        this.matchId = matchId;
        this.fedCode = fedCode;
    }

    getJson(method) {
        var fedCode = this.fedCode;
        var matchId = this.matchId;
        return new Promise(function (resolve, reject) {
            var url = 'https://dataprojectserviceswebapi.azurewebsites.net/v1/VO/' + fedCode + '/';
            url += method;

            console.log(url);
            request({
                method: 'GET',
                url: url,
                auth: {
                    bearer: listAuth
                }
            }, function (error, response, body) {
                console.log(error);
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }
            }, function (er1, er2) {
                console.log(er1, er2);
            });
        })
    }

}

var downloadFile = function(uri, filename, callback){
    console.log('Downloading file');
    request.head(uri, function(err, res, body){
        if (err) callback(err, filename);
        else if (res.statusCode >= 400) {
            callback({status: res.statusCode}, filename);
        }
        else {
            console.log(uri);
            var stream = request(uri);
            stream.pipe(
                fs.createWriteStream(filename)
                    .on('error', function(err){
                        callback(error, filename);
                        stream.read();
                    })
            )
                .on('close', function() {
                    callback(null, filename);
                });
        }
    });
};




module.exports = {
    Match: Match,
    MatchList: MatchList
};