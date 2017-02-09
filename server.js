var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var iconvlite = require('iconv-lite');

var app = express ();


function getPlayersInfo (club, players, callback) {
    var map = {
        'NTNUI': 108,
        'Viking': 109,
        'Førde VBK': 103,
        'Koll': 104,
        'TVN': 110,
        'Randaberg': 107,
        'BK Tromsø': 102
    };
    console.log('Looking for ' + club);
    var url = "http://poengliga.no/pl_team_show_detail.php?id=" + map[club];

    console.log(url);
    var infoPlayers = [];
    request({
        url: url,
        encoding: "latin1"
    }, function (error, response, html) {

        var $ = cheerio.load(html);

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
                number: tds.eq(0).text(),
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

        for (var i in players) {
            player = players[i];

            for (var j in infoPlayers) {
                infoPlayer = infoPlayers[j];

                if (infoPlayer.name == player.name) {

                    player.height = infoPlayer.height;
                    player.position = infoPlayer.position;
                    player.birthdate = infoPlayer.birthdate;
                    player.reach = infoPlayer.reach;
                    player.blockReach = infoPlayer.blockReach;
                    player.id = infoPlayer.id;
                    player.deleted = false;

                    nameParts = player.name.split(/[,\s]+/);
                    player.name = nameParts[1] + ' ' + nameParts[0];
                    break;
                }
            }
        }

        callback.call(this, players);

    });
}

getPlayersInfo('NTNUI', [{'name': 'Hamnes, Rune'}], function (players)  {
    console.log(players);
});

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

        // Lookup more player info:
        getPlayersInfo(game.homeTeam.name, game.homeTeam.players, function (players) {
            game.homeTeam.players = players;
            getPlayersInfo(game.awayTeam.name, game.awayTeam.players, function (players) {
                game.awayTeam.players = players;
                res.send(JSON.stringify(game));
            });
        });


    });
});

// Static stuff:
app.use(express.static('app'));

// Rewrite
app.use('/lib', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/angular/'));
app.use('/lib/bootstrap', express.static(__dirname + '/node_modules/angular-ui-bootstrap/dist/'));
app.use('/lib/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css/'));


app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})

