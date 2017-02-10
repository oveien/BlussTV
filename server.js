var express = require('express');
var router = express.Router();

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var iconvlite = require('iconv-lite');

var bodyParser = require("body-parser");

var CasparCG = require("caspar-cg");
var sanitize = require("sanitize-filename");

ccg = new CasparCG("127.0.0.1", 5250);

var app = express ();

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        if (err) callback(err, filename);
        else {
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
                birthdate: tds.eq(4).text(),
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

                    var filename = playersDir + '/' +  infoPlayer.id + '.jpg';

                    if (!fs.existsSync(filename)) {
                        download('http://poengliga.no/img_players/' + player.id + '.jpg', filename, function (err) {
                            console.log('Downloaded image')
                        });
                    }
                    f = true;
                    break;
                }
            }

            if (!f) {
                nameParts = infoPlayer.name.split(/[,\s]+/);
                infoPlayer.name = nameParts[1] + ' ' + nameParts[0];

            }

        }

        console.log(infoPlayers);
        callback.call(this, infoPlayers);

    });
}


app.get('/game-info', function (req, res) {


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
            getPlayersInfo(sex, game.awayTeam.name, game.awayTeam.players, function (players) {
                game.awayTeam.players = players;
                res.send(JSON.stringify(game));
            });
        });


    });
});


router.get("/update-score",function(req,res) {
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
                    setPoints: [0, 0, 0, 0, 0]
                },
                awayTeam: {
                    name: '',
                    players: [],
                    sets: 0,
                    points: 0,
                    setPoints: [0, 0, 0, 0, 0]
                }
            };

            var $ = cheerio.load(html);

            var tbl = $('table').eq(3);

            var teamRows = $('table').eq(1).find('tr');

            var homeTeamRow = teamRows.eq(2);
            var awayTeamRow = teamRows.eq(3);


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


            game.awayTeam.setPoints[0] = parseInt(awayTeamRow.find('th').eq(3).text());
            game.awayTeam.setPoints[1] = parseInt(awayTeamRow.find('th').eq(4).text());
            game.awayTeam.setPoints[2] = parseInt(awayTeamRow.find('th').eq(5).text());
            game.awayTeam.setPoints[3] = parseInt(awayTeamRow.find('th').eq(6).text());
            game.awayTeam.setPoints[4] = parseInt(awayTeamRow.find('th').eq(7).text());

            game.awayTeam.setPoints[4] = Math.floor(Math.random() * (15 - 1 + 1)) + 1;


            res.send(JSON.stringify(game));
        }
        else {
            res.send(JSON.stringify({error: 1}));
        }
    });
});

router.post("/caspar/play-stream",function(req,res){ //
    ccg.connect(function () {
        console.log('Connected to Caspar-server')
        var addCommand = 'PLAY 1-1 "' + req.body.stream + '"';

        console.log(addCommand);
        ccg.sendCommand(addCommand, function () {
            res.send('Command was sent');
        });
    });
});

router.post("/caspar/templates/:template/:what",function(req,res){ //
    console.log('Loading template: ' + req.params.template);
    ccg.connect(function () {
        console.log('Connected to Caspar-server')


        if (req.params.what == 'play') {
            var path = "http://127.0.0.1:3000/templates/" + req.params.template;
            var addCommand = 'PLAY 1-11 [HTML] "' + path + '"';

            console.log('Loading ' + path);

            var updateCommand = "CALL 1-11 UPDATE " + JSON.stringify(JSON.stringify(req.body)) + "";
            ccg.sendCommand(addCommand, function () {
                ccg.sendCommand(updateCommand, function () {
                    console.log('Command was sent')

                    ccg.disconnect();

                    res.send('Command was sent');
                })
            });
        }
        else if (req.params.what == 'remove') {
            var removeCommand = 'CALL 1-11 REMOVE ""';
            ccg.sendCommand(removeCommand, function () {
                console.log('Ran remove')
                res.send('Command was sent');
            });
        }
        else if (req.params.what == 'update') {
            var updateCommand = "CALL 1-11 UPDATE " + JSON.stringify(JSON.stringify(req.body)) + "";
            console.log(updateCommand);
            ccg.sendCommand(updateCommand, function () {
                console.log('Ran update')
                res.send('Command was sent');
            });
        }

    });
});


router.get("/graphics/:club/players/:id/image",function(req,res) { //
    var safeClubName = sanitize(req.params.club);

    var clubDir = __dirname + '/data/' + safeClubName;
    var playersDir = clubDir + '/' + '/players/';

    var playerImagePath = playersDir + '/' + req.params.id + '.jpg';
    console.log(playerImagePath);

    if (!fs.existsSync(playerImagePath)) {
        playerImagePath = __dirname + '/data/player-nopicture.png';
    }

    console.log(playerImagePath);

    res.sendFile(playerImagePath);
});

router.get("/graphics/:club/logo.jpg",function(req,res) { //
    var safeClubName = sanitize(req.params.club);

    var clubDir = __dirname + '/data/' + safeClubName;
    var logoDir = clubDir + '/logo.jpg';


    res.sendFile(logoDir);
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static stuff:
app.use(express.static('app'));

// Rewrite
app.use('/lib', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/angular/'));
app.use('/lib/bootstrap', express.static(__dirname + '/node_modules/angular-ui-bootstrap/dist/'));
app.use('/lib/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css/'));



app.use("/",router);

app.use("*",function(req,res){
    res.sendFile(__dirname + "/app/404.html");
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})

