/* Backup of poengliga-related classes and functions */
var cheerio = require('cheerio');
var request = require('request');

router.get("/update-score",function(req,res) {
    console.log('Update score: ' + req.query.url);
    request({
        url: req.query.url,
        encoding: "latin1"
    }, function (error, response, html) {
        console.log(req.query.url);
        console.log(error);
        if (!error) {

            // Fix buggy html:
            html = html.replace(/<\/td><th>/g, "</td><td>");

            var game = {
                homeTeam: {
                    name: '',
                    players: [],
                    sets: 0,
                    points: 0,
                    setPoints: [0, 0, 0, 0, 0],
                    blocks: 0,
                    attack: 0,
                    ace: 0
                },
                awayTeam: {
                    name: '',
                    players: [],
                    sets: 0,
                    points: 0,
                    setPoints: [0, 0, 0, 0, 0],
                    blocks: 0,
                    attack: 0,
                    ace: 0
                }
            };

            var $ = cheerio.load(html);

            var tbl = $('table').eq(3);

            var teamRows = $('table').eq(1).find('tr');

            var homeTeamRow = teamRows.eq(2);
            var awayTeamRow = teamRows.eq(3);
            var infoRow = teamRows.eq(1);

            game.homeTeam.name = homeTeamRow.find('th').eq(1).text();
            game.awayTeam.name = awayTeamRow.find('th').eq(1).text();

            game.homeTeam.sets = parseInt(homeTeamRow.find('th').eq(2).text());
            game.awayTeam.sets = parseInt(awayTeamRow.find('th').eq(2).text());

            var setNum = game.homeTeam.sets + game.awayTeam.sets;

            game.homeTeam.points = homeTeamRow.find('th').eq(2 + setNum).text();
            game.awayTeam.points = awayTeamRow.find('th').eq(2 + setNum).text();

            game.homeTeam.setPoints[0] = parseInt(homeTeamRow.find('th').eq(3).text());
            game.homeTeam.setPoints[1] = parseInt(homeTeamRow.find('th').eq(4).text());
            game.homeTeam.setPoints[2] = parseInt(homeTeamRow.find('th').eq(5).text());
            game.homeTeam.setPoints[3] = parseInt(homeTeamRow.find('th').eq(6).text());
            game.homeTeam.setPoints[4] = parseInt(homeTeamRow.find('th').eq(7).text());

            var opponentErrorIndex = 11;
            console.log('Info row');
            console.log(infoRow.find('th').eq(5).text());
            console.log(infoRow.find('th').eq(6).text());
            if ( infoRow.find('th').eq(6).text() == 'GS') {
                opponentErrorIndex = 12;
            }

            game.homeTeam.opponentErrors = parseInt(homeTeamRow.find('th').eq(opponentErrorIndex).text());


            game.awayTeam.setPoints[0] = parseInt(awayTeamRow.find('th').eq(3).text());
            game.awayTeam.setPoints[1] = parseInt(awayTeamRow.find('th').eq(4).text());
            game.awayTeam.setPoints[2] = parseInt(awayTeamRow.find('th').eq(5).text());
            game.awayTeam.setPoints[3] = parseInt(awayTeamRow.find('th').eq(6).text());
            game.awayTeam.setPoints[4] = parseInt(awayTeamRow.find('th').eq(7).text());

            game.awayTeam.opponentErrors = parseInt(awayTeamRow.find('th').eq(opponentErrorIndex).text());

            console.log('AT');
            console.log(awayTeamRow.find('th').eq(11).text())

            // FIXMEEE!!!!
            //game.awayTeam.setPoints[4] = Math.floor(Math.random() * (15 - 1 + 1)) + 1;

            nameParts = null;
            tbl.find('tr').each(function () {
                var cols = $(this).find('td');

                var player = {};

                player.name = cols.eq(4).text();
                player.number = cols.eq(5).text();
                player.ace = parseInt(cols.eq(0).text());
                player.attack = parseInt(cols.eq(1).text());
                player.blocks = parseInt(cols.eq(2).text());

                if (player.name && player.number != '-' && !player.name.match(/^\d+$/)) {
                    nameParts = player.name.split(/[,\s]+/);
                    player.name = nameParts[1] + ' ' + nameParts[0];

                    player.points = (player.ace + player.blocks + player.attack);
                    game.homeTeam.blocks += player.blocks;
                    game.homeTeam.attack += player.attack;
                    game.homeTeam.ace += player.ace;
                    game.homeTeam.players.push(player);
                }

                player = {};
                player.name = cols.eq(6).text();
                player.number = cols.eq(5).text();
                player.ace = parseInt(cols.eq(7).text());
                player.attack = parseInt(cols.eq(8).text());
                player.blocks = parseInt(cols.eq(9).text());

                if (player.name && player.number != '-' && !player.name.match(/^\d+$/)) {
                    nameParts = player.name.split(/[,\s]+/);
                    player.name = nameParts[1] + ' ' + nameParts[0];
                    player.points = (player.ace + player.blocks + player.attack);
                    game.awayTeam.blocks += player.blocks;
                    game.awayTeam.attack += player.attack;
                    game.awayTeam.ace += player.ace;
                    game.awayTeam.players.push(player);
                }
            });


            res.send(JSON.stringify(game));
        }
        else {
            res.send(JSON.stringify({error: 1}));
        }
    });
});


app.get('/game-info', function (req, res) {
    console.log('Game info')
    console.log(req.query.url);
    request({
        url: req.query.url,
        encoding: "latin1"
    }, function (error, response, html) {
        if (!error) {

            // Fix buggy html:
            html = html.replace(/<\/td><th>/g, "</td><td>");

            var game = {
                homeTeam: {
                    name: '',
                    players: [],
                    sets: 0,
                    points: 0
                },
                awayTeam: {
                    name: '',
                    players: [],
                    sets: 0,
                    points: 0
                }
            };
            var $ = cheerio.load(html);

            var tbl = $('table').eq(3);

            var teamRows = $('table').eq(1).find('tr');

            var homeTeamRow = teamRows.eq(2);
            var awayTeamRow = teamRows.eq(3);
            game.homeTeam.name = homeTeamRow.find('th').eq(1).text();
            game.awayTeam.name = awayTeamRow.find('th').eq(1).text();

            game.homeTeam.logo = '/graphics/' + sanitize(game.homeTeam.name) + '/logo.jpg';
            game.awayTeam.logo = '/graphics/' + sanitize(game.awayTeam.name) + '/logo.jpg';

            game.homeTeam.sets = parseInt(homeTeamRow.find('th').eq(2).text());
            game.awayTeam.sets = parseInt(awayTeamRow.find('th').eq(2).text());

            var setNum = game.homeTeam.sets + game.awayTeam.sets;

            game.homeTeam.points = homeTeamRow.find('th').eq(2 + setNum).text();
            game.awayTeam.points = awayTeamRow.find('th').eq(2 + setNum).text();


            tbl.find('tr').each(function () {
                var cols = $(this).find('td');

                var player = {};

                player.name = cols.eq(4).text();
                player.number = cols.eq(5).text();
                player.ace = cols.eq(0).text();
                player.attack = cols.eq(1).text();
                player.blocks = cols.eq(2).text();


                if (player.name && player.number != '-' && !player.name.match(/^\d+$/)) {
                    game.homeTeam.players.push(player);
                }

                player = {};
                player.name = cols.eq(6).text();
                player.number = cols.eq(5).text();
                player.ace = cols.eq(7).text();
                player.attack = cols.eq(8).text();
                player.blocks = cols.eq(9).text();


                if (player.name && player.number != '-' && !player.name.match(/^\d+$/)) {
                    game.awayTeam.players.push(player);
                }
            });
        }


        var sex = 'm';

        if (req.query.url.match(/elited/)) {
            sex = 'f';
        }

        // Lookup more player info:
        getPlayersInfo(sex, game.homeTeam.name, game.homeTeam.players, function (players) {
            game.homeTeam.players = players;
            game.sex = sex;
            getPlayersInfo(sex, game.awayTeam.name, game.awayTeam.players, function (players) {
                game.awayTeam.players = players;
                res.send(JSON.stringify(game));
            });
        });


    });
});


function getPlayersInfo (sex, club, players, callback) {
    var map = null;
    var url = '';
    if (sex == 'm') {
        map = {
            'NTNUI': 108,
            'Viking': 109,
            'Førde VBK': 103,
            'Koll': 104,
            'TVN': 110,
            'Randaberg': 107,
            'BK Tromsø': 102
        };
        url = "http://poengliga.no/pl_team_show_detail.php?id=";
    }
    else {
        map = {
            'Oslo Volley': 205,
            'Viking': 214,
            'Førde VBK': 202,
            'Koll': 207,
            'ToppVolley': 212,
            'Randaberg': 210,
            'OSI': 215,
            'Tønsberg': 213
        };
        url = "http://poengliga.no/pl_team_show_detail_w.php?id=";
    }

    url += map[club];

    console.log('Looking for ' + club);
    console.log(url);

    var infoPlayers = [];
    console.log('Info players: ' + url);
    request({
        url: url,
        encoding: "latin1"
    }, function (error, response, html) {

        var $ = cheerio.load(html);

        // Club logo:
        var logo = $('table[cellpadding=3] td[colspan="4"][valign="top"] img').attr('src');

        // Get image:
        var safeClubName = sanitize(club);
        var clubDir = __dirname + '/data/' + safeClubName;
        var playersDir = clubDir + '/' + '/players/';

        if (!fs.existsSync(clubDir)) {
            console.log('Creating ' + clubDir)
            fs.mkdirSync(clubDir);
        }
        if (!fs.existsSync(playersDir)) {
            console.log('Creating ' + playersDir)
            fs.mkdirSync(playersDir);
        }

        var logoPath = clubDir + '/logo.jpg';
        if (!fs.existsSync(logoPath)) {
            download('http://poengliga.no/' + logo, logoPath, function (err) {
                console.log('Downloaded image')
            });
        }



        var nrFound = false;
        var rows = $('table[cellpadding="3"]').find('tr').each ( function () {

            var tds = $(this).find('td');
            //console.log('>' + tds.eq(0).text() + '<');
            if (tds.eq(0).text() == 'Nr') {
                nrFound = true;
                return true;
            }

            if (!nrFound) {
                return true;
            }

            var player = {
                number: parseInt(tds.eq(0).text()),
                name: tds.eq(1).text(),
                height: tds.eq(2).text(),
                position: tds.eq(3).text(),
                birthyear: tds.eq(4).text(),
                reach: tds.eq(5).text(),
                blockReach: tds.eq(6).text(),
                id: tds.eq(7).text()
            }

            infoPlayers.push(player);
        });


        var player = "";
        var infoPlayer = "";
        var nameParts = null;


        for (var j in infoPlayers) {

            infoPlayer = infoPlayers[j];
            infoPlayer.deleted = true;

            var f = false;
            for (var i in players) {
                player = players[i];

                if (infoPlayer.name == player.name) {

                    infoPlayer.deleted = false;
                    infoPlayer.number = player.number;
                    infoPlayer.ace = player.ace;
                    infoPlayer.attack = player.attack;
                    infoPlayer.blocks = player.blocks;

                    nameParts = player.name.split(/[,\s]+/);
                    infoPlayer.name = nameParts[1] + ' ' + nameParts[0];

                    var filename = playersDir + '/' +  infoPlayer.id + '_' + sex + '.jpg';

                    infoPlayer.sid = infoPlayer.id + '_' + sex;
                    if (!fs.existsSync(filename)) {
                        var baseUrl = 'http://poengliga.no/img_players/';
                        console.log('Downloading image...');
                        console.log(sex);
                        if (sex == 'f') {
                            baseUrl = 'http://poengliga.no/img_players_w/';
                            console.log('Women picture');
                        }
                        console.log(baseUrl + infoPlayer.id + '.jpg');
                        download(baseUrl + infoPlayer.id + '.jpg', filename, function (err) {
                            console.log('Downloaded image')
                        });
                    }
                    infoPlayer.image = '/graphics/'+encodeURIComponent(safeClubName)+'/players/'+infoPlayer.id + '_' + sex +'/image';
                    f = true;
                    break;
                }
            }

            if (!f) {
                nameParts = infoPlayer.name.split(/[,\s]+/);
                infoPlayer.name = nameParts[1] + ' ' + nameParts[0];

            }

        }

        //console.log(infoPlayers);
        callback.call(this, infoPlayers);

    });
}

app.get('/poengliga-matches/', function (req, res) {
    //var url = 'http://localhost:3000/kamper.html';
    var url = 'http://www.poengliga.no/liveres.php';

    request({
        url: url,
        encoding: "utf-8"
    }, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var games = [];

            $('table[cellpadding=2]').each ( function () {
                console.log('Got table');
                var gameLink = $(this).find('a').attr('href');
                var homeTeam = $(this).find('th[align=left][width=150]').text();
                var awayTeam = $(this).find('tr').eq(2).find('th[align=left]').text();

                var title = '';
                if (gameLink.match(/eliteh/)) {
                    title = 'Herrer: ';
                }
                else {
                    title = 'Damer: ';
                }

                title += homeTeam + ' - ' + awayTeam;
                games.push({
                    homeTeam: homeTeam,
                    awayTeam: awayTeam,
                    poengligaGameUrl: 'http://www.poengliga.no/' + gameLink,
                    title: title
                })
            });

            res.send(JSON.stringify(games));
        }
    });
});