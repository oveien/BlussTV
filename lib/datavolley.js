let request = require('request');
let sanitize = require('sanitize-filename');
let fs = require('fs');
let path = require('path');
let iterate = require('async-iterate');
const NodeCache = require('node-cache');

var liveAuth = process.env.DATAVOLLEY_LIVE_API_KEY;
var listAuth = process.env.DATAVOLLEY_ADMIN_API_KEY;

const cache = new NodeCache();

function dateIsInTheNextWeek(startDate, endDate) {
    const now = new Date().toISOString()
      .slice(0, 10)
      .replace(/-/g, '')
    const date = new Date();
    date.setDate(date.getDate() + 7)
    const oneWeekFromNow = date.toISOString()
      .slice(0, 10)
      .replace(/-/g, '')
    startDate = parseInt(
        startDate
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '')
    );
    endDate = parseInt(
        endDate
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '')
    );

    if (
      (startDate <= now && endDate >= now) ||
      (startDate >= now && startDate < oneWeekFromNow)
    ) {
        return true;
    }

    return false;
}

class MatchList {
    constructor(fedCode = 'NVBF') {
        this.service = new DataVolleyService(fedCode);
    }

    _getSeasonId() {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.service.getJson('Season?seasontype=2').then((data) => {
                var seasonId = -1;

                for (var i = 0; i < data.length; i++) {
                    if (data[i].Code == 'TEST' || data[i].Closed) {
                        continue;
                    }

                    seasonId = data[i].SeasonID;
                }
                console.log('Season id', seasonId)
                resolve(seasonId);
            }).catch(err => {
              console.log('Error', err);
              reject(err);
            })
        });
    }

    _getSeasonCompetitions(seasonId) {
        let self = this;
        return new Promise(function(resolve, reject) {
            let competitions = [];
            self.service
                .getJson('Competition?seasonID=' + seasonId)
                .then((data) => {
                    for (var i = 0; i < data.length; i++) {
                        if (
                            dateIsInTheNextWeek(
                                new Date(data[i].DateFrom),
                                new Date(data[i].DateTo)
                            )
                        ) {
                            competitions.push(data[i].CompetitionID);
                        }
                    }
                    resolve(competitions);
                });
        });
    }

    _getCompetitionPhases(competitions) {
        let self = this;
        return new Promise(function(resolve, reject) {
            let phases = [];

            iterate.each(
                competitions,
                function(value, key, done) {
                    self.service
                        .getJson('Phase?competitionID=' + value)
                        .then((data) => {
                            for (var i = 0; i < data.length; i++) {
                                var found = false;
                                if (
                                    dateIsInTheNextWeek(
                                        new Date(data[i].DateFrom),
                                        new Date(data[i].DateTo)
                                    ) || found
                                ) {
                                    phases.push(data[i].PhaseID);
                                }
                            }
                            done(null);
                        });
                },
                function(err, data) {
                    resolve(phases);
                }
            );
        });
    }

    _getPhasesChampionships(phases) {
        let self = this;
        return new Promise(function(resolve, reject) {
            var championships = [];
            iterate.each(
                phases,
                function(value, key, done) {
                    self.service
                        .getJson('Championship?phaseID=' + value)
                        .then((data) => {
                            for (var i = 0; i < data.length; i++) {
                                console.log('Date is', data[i])
                                if (
                                    dateIsInTheNextWeek(
                                        new Date(data[i].DateFrom),
                                        new Date(data[i].DateTo)
                                    )
                                ) {
                                    championships.push(data[i].ChampionshipID);
                                }
                            }
                            done();
                        });
                },
                function(err, data) {
                    resolve(championships);
                }
            );
        });
    }

    _getChampionshipsLegs(championships) {
        let self = this;
        return new Promise(function(resolve, reject) {
            var legs = [];
            iterate.each(
                championships,
                function(value, key, done) {
                    self.service
                        .getJson('Leg?championshipID=' + value)
                        .then((data) => {
                            for (var i = 0; i < data.length; i++) {
                                if (
                                    dateIsInTheNextWeek(
                                        new Date(data[i].DateFrom),
                                        new Date(data[i].DateTo)
                                    )
                                ) {
                                    legs.push(data[i].LegID);
                                }
                            }
                            done();
                        });
                },
                function(err, none) {
                    resolve(legs);
                }
            );
        });
    }

    _getLegMatches(legs) {
        let self = this;
        return new Promise(function(resolve, reject) {
            var games = [];
            console.log('Legs', legs);
            iterate.each(
              legs,
              function(value, key, done) {
                  self.service
                    .getJson('Match?legID=' + value)
                    .then((data) => {
                        for (var i = 0; i < data.length; i++) {
                            if (
                              dateIsInTheNextWeek(
                                new Date(data[i].MatchDateTime),
                                new Date(data[i].MatchDateTime)
                              )
                            ) {
                                games.push(data[i]);
                            }
                            legs.push(data[i].LegID);
                        }
                        done();
                    });
              },
              function() {
                  resolve(games);
              }
            );
        });
    }

    getCurrentMatches() {
        var self = this;

        return new Promise(function(resolve, reject) {

            self
              ._getSeasonId()
              .then((seasonId) => {
                  console.log('Season id', seasonId);
                  return self._getSeasonCompetitions(seasonId)
              })
              .then((competitions) => {
                console.log('Competitions', competitions)
                return self._getCompetitionPhases(competitions)
              })
              .then((phases) =>
                self._getPhasesChampionships(phases)
              )
              .then((championships) =>
                self._getChampionshipsLegs(championships)
              )
              .then((legs) => self._getLegMatches(legs))
              .then((games) => {
                  games.sort( function (a, b) {
                      if (a.MatchDateTime < b.MatchDateTime) return -1;
                      if (a.MatchDateTime > b.MatchDateTime) return 1;
                      return 0;
                  });

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
                              name: games[i].GuestTeam,
                          },
                          time: games[i].MatchDateTime,
                          // This is always false?
                          sex: (games[i].MaleNotFemale) ? 'M' : 'K'
                      });
                  }
                  resolve(ret);
              }).catch(err => {
                  reject(err);
            })
        })
    }
}

class Match {
    constructor(fedCode, matchId) {
        this.matchId = matchId;
        this.fedCode = fedCode;
        this.service = new DataVolleyLiveService(matchId, fedCode);
        this.listService = new DataVolleyService(fedCode);
    }

    static getInstance(fedCode, matchId) {
        var key = fedCode + '--' + matchId;
        if (typeof Match.instances[key] == 'undefined') {
            Match.instances[key] = new Match(fedCode, matchId);
        }
        console.log(key);
        return Match.instances[key];
    }

    getGameInfo(updateOnly) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.service
                .getJson('MatchLiveFullInfo')
                .then((data) => {
                    if (!data) {
                        console.log('Reject at once');
                        reject('Unable to get data');
                    }
                    //                console.log(data);
                    var gameData = {
                        homeTeam: {},
                        awayTeam: {},
                    };

                    self.homeTeam = {
                        id: data.HID,
                        name: data.HTN,
                    };

                    self.awayTeam = {
                        id: data.GID,
                        name: data.GTN,
                    };

                    gameData.homeTeam.name = self.getName(data.HTN);
                    gameData.awayTeam.name = self.getName(data.GTN);

                    gameData.currentSet = data.CSet;

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
                    ];

                    gameData.homeTeam.points = data.CHP;
                    gameData.awayTeam.points = data.CGP;

                    if (data.SSix) {
                        gameData.homeTeam.lineup = [];
                        gameData.awayTeam.lineup = [];

                        for (var i = 0; i < data.SSix.LUPH.length; i++) {
                            gameData.homeTeam.lineup.push(data.SSix.LUPH[i].PN);
                        }

                        for (var i = 0; i < data.SSix.LUPG.length; i++) {
                            gameData.awayTeam.lineup.push(data.SSix.LUPG[i].PN);
                        }
                    }

                    if (!updateOnly) {
                        self.getRoster().then((players) => {
                            (gameData.homeTeam.players = players.homeTeam),
                                (gameData.awayTeam.players = players.awayTeam),
                                self.listService
                                    .getJson('PlayerTeam?TeamID=' + data.HID)
                                    .then(function(players) {
                                        self.listService
                                            .getJson(
                                                'PlayerTeam?TeamID=' + data.GID
                                            )
                                            .then(function(players2) {
                                                players = players.concat(
                                                    players2
                                                );

                                                for (
                                                    i = 0;
                                                    i < players.length;
                                                    i++
                                                ) {
                                                    var p = players[i];

                                                    var pos = '';
                                                    switch (p.Position) {
                                                        case "Opposite":
                                                            pos = 'Diagonal';
                                                            break
                                                        case "Wing-spiker":
                                                            pos = 'Kant';
                                                            break
                                                        case "Middle-Blocker":
                                                            pos = 'Midt';
                                                            break
                                                        case "Setter":
                                                            pos = 'Opplegger';
                                                            break
                                                        case "Libero":
                                                            pos = 'Libero';
                                                            break
                                                    }

                                                    var dob = new Date(
                                                        p.DateOfBirth
                                                    );
                                                    var y = dob.getFullYear();

                                                    var team = 'homeTeam';
                                                    if (p.TeamID != data.HID) {
                                                        team = 'awayTeam';
                                                    }

                                                    for (
                                                        var j = 0;
                                                        j <
                                                        gameData[team].players
                                                            .length;
                                                        j++
                                                    ) {
                                                        if (
                                                            gameData[team]
                                                                .players[j]
                                                                .id ==
                                                            p.PersonID
                                                        ) {
                                                            gameData[
                                                                team
                                                            ].players[
                                                                j
                                                            ].position = pos;
                                                            gameData[
                                                                team
                                                            ].players[
                                                                j
                                                            ].birthyear = y;
                                                            break;
                                                        }
                                                    }
                                                }
                                                resolve(gameData);
                                            });
                                    });
                        });
                    } else {
                        gameData.homeTeam.statistics = {
                            sets: [],
                            total: {},
                        };

                        gameData.awayTeam.statistics = {
                            sets: [],
                            total: {},
                        };

                        var homeStats = self.getStatsFromObject(data.PStatsH);
                        var awayStats = self.getStatsFromObject(data.PStatsG);

                        gameData.homeTeam.statistics.total = homeStats;
                        gameData.homeTeam.statistics.total.opponentErrors =
                            awayStats.errors;

                        gameData.awayTeam.statistics.total = awayStats;
                        gameData.awayTeam.statistics.total.opponentErrors =
                            homeStats.errors;

                        var addSetStatistics = function(data) {
                            var homeStats = self.getStatsFromObject(
                                data.PStatsH
                            );
                            var awayStats = self.getStatsFromObject(
                                data.PStatsG
                            );

                            homeStats.opponentErrors = awayStats.errors;
                            awayStats.opponentErrors = homeStats.errors;

                            gameData.homeTeam.statistics.sets.push(homeStats);
                            gameData.awayTeam.statistics.sets.push(awayStats);
                        };

                        iterate.each(
                            new Array(gameData.currentSet),
                            function(value, key, done) {
                                var setNum = key + 1;

                                var cacheKey =
                                    self.fedCode +
                                    '_' +
                                    self.matchId +
                                    '_' +
                                    setNum;
                                var value = cache.get(cacheKey);

                                console.log('Getting data for set ' + setNum);
                                if (value) {
                                    console.log(' - Found in cache');
                                    addSetStatistics(value);
                                    done();
                                } else {
                                    console.log(' - Fetching from service');
                                    self.service
                                        .getJson(
                                            'MatchLiveStats',
                                            '/Set/' + setNum
                                        )
                                        .then(
                                            function(data) {
                                                console.log(
                                                    ' - Got stats from match live stats'
                                                );
                                                // Allow 30 sek of cache for current set:
                                                var cacheTime = 30;
                                                if (
                                                    setNum < gameData.currentSet
                                                ) {
                                                    cacheTime = 1800;
                                                }
                                                cache.set(
                                                    cacheKey,
                                                    data,
                                                    cacheTime
                                                );
                                                addSetStatistics(data);
                                                done();
                                            },
                                            function(err) {
                                                console.log(err);
                                            }
                                        );
                                }
                            },
                            function() {
                                resolve(gameData);
                            }
                        );
                    }
                })
                .catch(function(err) {
                    console.log('Rethrow message');
                    console.log(err);
                    reject(err.Message);
                });
        });
    }

    getStatsFromObject(stats) {
        var ret = {
            blocks: 0,
            attack: 0,
            ace: 0,
            players: [],
            errors: 0,
        };

        if (!stats) {
            return ret;
        }

        for (var i = 0; i < stats.length; i++) {
            // Update stats:
            var player = {
                name: stats[i]['NM'] + ' ' + stats[i]['SR'],
                number: stats[i]['N'],
                ace: stats[i]['SWin'],
                blocks: stats[i]['BWin'],
                attack: stats[i]['SpWin'],
            };

            player.points = player.ace + player.blocks + player.attack;

            ret.blocks += player.blocks;
            ret.attack += player.attack;
            ret.ace += player.ace;
            ret.players.push(player);

            // Away team get opponent error:
            ret.errors += stats[i]['SErr'];
            //ret.errors += stats[i]['RErr'];
            ret.errors += stats[i]['SpErr'];
        }
        return ret;
    }

    getCurrentScore() {
        console.log('Getting current score');
        this.service.getJson('MatchInfo').then((data) => {
            console.log('Got data');
            console.log(data);
        });
    }

    getRoster() {
        console.log('Getting roster');
        var self = this;
        return new Promise(function(resolve, reject) {
            self.service.getJson('Roster').then((data) => {
                var htPlayers = [];

                iterate.each(
                    data.RH,
                    function(value, key, done) {
                        var player = {
                            number: parseInt(value.N),
                            name: value.NM + ' ' + value.SR,
                            height: '',
                            position: '',
                            birthyear: '',
                            reach: '',
                            blockReach: '',
                            id: value.PID,
                        };
                        htPlayers.push(player);

                        console.log('Downloading HT player image');
                        self.downloadPlayerImage('home', player.id, function(
                            path
                        ) {
                            if (path) {
                                player.image = path;
                            }
                            done();
                        });
                    },
                    function() {
                        var atPlayers = [];
                        iterate.each(
                            data.RG,
                            function(value, key, done) {
                                var player = {
                                    number: parseInt(value.N),
                                    name: value.NM + ' ' + value.SR,
                                    height: '',
                                    position: '',
                                    birthyear: '',
                                    reach: '',
                                    blockReach: '',
                                    id: value.PID,
                                };

                                console.log('Downloading AT player image');
                                self.downloadPlayerImage(
                                    'away',
                                    player.id,
                                    function(path) {
                                        if (path) {
                                            player.image = path;
                                        }
                                        atPlayers.push(player);
                                        done();
                                    }
                                );
                            },
                            function() {
                                resolve({
                                    homeTeam: htPlayers,
                                    awayTeam: atPlayers,
                                });
                            }
                        );
                    }
                );
            });
        });
    }

    getName(team) {
      switch (team) {
        case 'NTNUI Volleyball':
          return "NTNUI";
        case "ToppVolley Norge":
            return "TVN";
        case 'Førde Volleyballklubb':
            return "Førde VBK";
      }
      return team;
    }

    getLogoPath(team) {
        console.log('Logo' + team);
        var map = {
            "Blindheim IL": 'blindheim',
             "ØKSIL": 'oksil',
             'Vestli IL': 'vestli',
            'ToppVolley Norge': 'tvn',
            'ToppVolley Norge 2': 'tvn',
            'Førde Volleyballklubb': 'forde',
            'Førde VBK 2': 'forde',
            'NTNUI Volleyball': 'ntnui',
            'NTNUI 2': 'ntnui',
            'Oslo Volley': 'oslovolley',
            'Koll IL': 'koll',
            'TIF Viking': 'viking',
            'TIF Viking 2': 'viking',
            'Randaberg IL': 'randaberg',
            'OSI': 'osi',
            'OSI 2': 'osi',
            'Stod IL': 'stod',
            'BK Tromsø': 'bktromso',
            'BK Tromsø 2': 'bktromso',
            'Asker': 'asker',
            "Torvastad": "torvastad",
            'TEST Team A': 'ntnui',
            'TEST Team B': 'osi',
            'Askim VBK': 'askim',
            "Lierne IL": 'lierne',
            "Spirit Lørenskog": 'spiritlorenskog',
            "Sandnes VBK": 'sandnes',
            "SK Rival": 'rival',
            "KFUM Volda": 'volda'
        };

        console.log(`Logo for >${team}<`)
        return '/graphics/logo/' + map[team] + '.svg';
    }

    downloadPlayerImage(team, playerId, callback) {
        var teamId = -1;
        var teamName = '';
        if (team == 'home') {
            teamId = this.homeTeam.id;
            teamName = this.homeTeam.name;
        } else {
            teamId = this.awayTeam.id;
            teamName = this.awayTeam.name;
        }

        var safeClubName = sanitize(teamName);
        var clubDir = path.dirname(__dirname) + '/data/' + safeClubName;
        var playersDir = clubDir + '/' + '/players/';
        var fileName = playersDir + '/' + playerId + '.jpg';

        var webUrl =
            '/graphics/' +
            safeClubName.replace(/ /g, '%20') +
            '/players/' +
            playerId +
            '/image';

        // Skip download for now, images not used
        if (false && !fs.existsSync(fileName)) {
            if (!fs.existsSync(clubDir)) {
                console.log('Creating ' + clubDir);
                fs.mkdirSync(clubDir);
            }
            if (!fs.existsSync(playersDir)) {
                console.log('Creating ' + playersDir);
                fs.mkdirSync(playersDir);
            }

            var imageUrl =
                'https://dataprojectimagestorage.blob.core.windows.net:443/nvbf/TeamPlayer/TeamPlayer_' +
                teamId +
                '_' +
                playerId +
                '.jpg';

            console.log('Downloading file ' + imageUrl);

            downloadFile(imageUrl, fileName, function(err) {
                if (err) {
                    callback(null);
                } else {
                    callback(webUrl);
                }
            });
        } else {
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

    getJson(method, extra) {
        var fedCode = this.fedCode;
        var matchId = this.matchId;
        return new Promise(function(resolve, reject) {
            var url =
                'https://dataprojectserviceswebapilive.azurewebsites.net/api/v1/' +
                fedCode +
                '/';
            url += method;
            url += '/FedMatchID/';
            url += matchId;
            if (extra) {
                url += extra;
            }

            console.log(url);
            request(
                {
                    method: 'GET',
                    url: url,
                    auth: {
                        bearer: liveAuth,
                    },
                },
                function(error, response, body) {
                    console.log('Request complete', error);
                    if (!error && response.statusCode == 200) {
                        var info = JSON.parse(body);
                        resolve(info);

                        /*
                    // dirname:
                    var fileName = __dirname + "/../cache/" + url.replace(/\//g, "_").replace(":", "_")
                    fs.writeFile(fileName, body, function(err) {
                        console.log('Write cache', err);
                    });

                    */
                    } else {
                        console.log(body);
                        reject('Wrong API error code');
                    }
                },
                function(er1, er2) {
                    console.log('Error callback', er1, er2);
                    reject(er1);
                }
            );
        });
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
        return new Promise(function(resolve, reject) {
            var url =
                'https://dataprojectserviceswebapi.azurewebsites.net/v1/VO/' +
                fedCode +
                '/';
            url += method;

            console.log('Fetching', url);
            request(
                {
                    method: 'GET',
                    url: url,
                    auth: {
                        bearer: listAuth,
                    },
                },
                function(error, response, body) {

                    if (!error && response.statusCode == 200) {
                        var info = JSON.parse(body);
                        resolve(info);
                    }
                    else {
                      const json = JSON.parse(body);
                      if (json.Message) {
                        reject(json.Message);
                      }
                      else {
                        reject('API error');
                      }
                    }
                },
                function(er1, er2) {
                    console.log(er1, er2);
                }
            );
        });
    }
}

var downloadFile = function(uri, filename, callback) {
    console.log('Downloading file');
    request.head(uri, function(err, res, body) {
        if (err) callback(err, filename);
        else if (res.statusCode >= 400) {
            callback({ status: res.statusCode }, filename);
        } else {
            console.log(uri);
            var stream = request(uri);
            stream
                .pipe(
                    fs.createWriteStream(filename).on('error', function(err) {
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
    MatchList: MatchList,
};
