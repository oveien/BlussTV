var CasparCG = require("caspar-cg");
ccg = new CasparCG("127.0.0.1", 5250);

var express = require('express');
var router = express.Router();

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var iconvlite = require('iconv-lite');

var bodyParser = require("body-parser");

var sanitize = require("sanitize-filename");

var io = require('socket.io');
var http = require('http');

var formidable = require("formidable");

var app = express ();
var path = require("path");

var ffdevices = require('ffdevices')

console.log(__dirname);

const PORT = process.env.PORT || 3000;


var download = function(uri, filename, callback){
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


            game.awayTeam.setPoints[0] = parseInt(awayTeamRow.find('th').eq(3).text());
            game.awayTeam.setPoints[1] = parseInt(awayTeamRow.find('th').eq(4).text());
            game.awayTeam.setPoints[2] = parseInt(awayTeamRow.find('th').eq(5).text());
            game.awayTeam.setPoints[3] = parseInt(awayTeamRow.find('th').eq(6).text());
            game.awayTeam.setPoints[4] = parseInt(awayTeamRow.find('th').eq(7).text());


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

router.post("/caspar/play-stream",function(req,res){ //
    ccg.connect(function () {
        console.log('Connected to Caspar-server')
        var addCommand = 'PLAY 1-1 "' + req.body.stream + '"';

        console.log(addCommand);
        ccg.sendCommand(addCommand, function () {
            res.send('Command was sent');

            ccg.disconnect();
        });
    });
});

router.post("/caspar/templates/:template/:what",function(req,res){ //
    console.log('Loading template: ' + req.params.template);
    ccg.connect(function () {
        console.log('Connected to Caspar-server')


        if (req.params.what == 'play') {
            var path = `http://127.0.0.1:${PORT}/templates/${req.params.template}`;
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
                ccg.disconnect();
            });
        }
        else if (req.params.what == 'update') {
            var updateCommand = "CALL 1-11 UPDATE " + JSON.stringify(JSON.stringify(req.body)) + "";
            console.log(updateCommand);
            ccg.sendCommand(updateCommand, function () {
                console.log('Ran update')
                res.send('Command was sent');
                ccg.disconnect();
            });
        }

    });
});

router.get("/directshow/devices",function(req,res) { //
    //ffdevices.ffmpegPath = path.dirname(__dirname) + '/ffmpeg//bin/ffmpeg.exe'
    console.log(path.dirname(__dirname) + '/bin/ffmpeg/ffmpeg.exe');
    ffdevices.getAll(function (error, devices) {
        console.log(error);
        if (!error) {
            devices.push({
                name: 'NTNUI - Førde',
                deviceType: 'file',
                path: 'NTNUI - Førde.mp4'
            });
            res.send(JSON.stringify(devices));
        }
        else {
            res.send(JSON.stringify({error: true}));
        }
    })
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

app.route('/upload-profile-image')
    .post(function (req, res, next) {
        // create an incoming form object
        var form = new formidable.IncomingForm();

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = false;

        // store all uploads in the /uploads directory
        form.uploadDir = path.join(__dirname, '/tmp/uploads');

        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        var ulPath = "";
        form.on('file', function(field, file) {
            ulPath = file.path;

        });

        // log any errors that occur
        form.on('error', function(err) {
            console.log('<script>alert("An error has occured: \n' + err + '");</script>');
        });

        var data = {};
        form.parse(req, function(err, fields, files) {
            data = fields;
        });
        // once all the files have been uploaded, send a response to the client
        form.on('end', function() {
            if (ulPath) {
                var safeClubPath = sanitize(data.team_name);
                var destPath = __dirname + '/data/' + safeClubPath + '/';
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath);
                }
                destPath += 'players/';
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath);
                }
                destPath +=  sanitize(data.player_sid) + '.jpg';
                console.log('Writing ' + destPath);
                fs.rename(ulPath, destPath);
            }
            res.end("<script>alert('Added image');</script>");
        });

        // parse the incoming request containing the form data
        form.parse(req);
    });

router.get("/graphics/:club/logo.jpg",function(req,res) { //
    var safeClubName = sanitize(req.params.club);

    var clubDir = __dirname + '/data/' + safeClubName;
    var filename = clubDir + '/logo.jpg';

    var svgFilename = __dirname + "/app/graphics/logo/" + safeClubName.toLowerCase() + ".svg";
    console.log(svgFilename);
    if (fs.existsSync(svgFilename)) {
        filename = svgFilename;
    }
    console.log(filename);
    res.sendFile(filename);
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
app.use('/lib', express.static(__dirname + '/node_modules/socket.io-client/dist/'));

app.get('/game/:gameId/control', function (req, res) {
    res.sendFile('game/index.html', {root: './app'});
})

app.get('/game/:gameId/app.js', function (req, res) {
    res.sendFile('game/app.js', {root: './app'});
})

app.get('/game/:gameId/overlay', function (req, res) {
    res.sendFile('obs/index.html', {root: './app'});
})




app.use("/",router);

app.use("*",function(req,res){
    res.sendFile(__dirname + "/app/404.html");
});

/*
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
*/

var server = http.createServer(app).listen(PORT);


var clients = {};
io = io.listen(server);
io.sockets.on("connection",function(socket){
    /*Associating the callback function to be executed when client visits the page and
     websocket connection is made */

    var message_to_client = {
        status: 'connected',
        data:"Connection with the server established"
    }

    socket.send(JSON.stringify(message_to_client));
    /*sending data to the client , this triggers a message event at the client side */
    console.log('Socket.io Connection with the client established');
    socket.on("message",function(data){
        /*This event is triggered at the server side when client sends the data using socket.send() method */
        data = JSON.parse(data);

        console.log(data);
        /*Printing the data */
        var ack_to_client = {
            data:"Server Received the message"
        }

        if (data.action == 'add_client') {
            console.log(data.data.gameCode);
            if (!data.data.gameCode) {
                return;
            }


            if (typeof(clients[data.data.gameCode]) == "undefined") {
                console.log('Setting client to game code')
                clients[data.data.gameCode] = []
            }

            var f = false;
            for (var i in clients[data.data.gameCode]) {
                if (clients[data.data.gameCode][i].conn.id == socket.id) {
                    // Can only sign up once:
                    f = true;
                    break;
                }
            }

            if (!f) {
                console.log('Adding client for ' + data.data.gameCode);
                clients[data.data.gameCode].push(socket);
            }
            return;
        }

        // All others go to the specific clients:
        if (clients[data.gameCode]) {
            for (var i in clients[data.gameCode]) {
                if (clients[data.gameCode][i].conn.id == socket.id) {
                    continue;
                }

                console.log('Sending message to client...');
                clients[data.gameCode][i].send(JSON.stringify(data));
            }
        }
        //socket.send(JSON.stringify(ack_to_client));
        /*Sending the Acknowledgement back to the client , this will trigger "message" event on the clients side*/
    });

    socket.on('disconnect',function(d1, d2) {
        var c = {};
        var numClients = 0;
        for (var gameCode in clients) {
            for (var i in clients[gameCode]) {
                if (clients[gameCode][i].conn.id == this.conn.id) {
                    continue;
                }
                if (typeof(c[gameCode]) == "undefined") {
                    c[gameCode] = [];
                }
                c[gameCode].push(clients[gameCode][i]);
                numClients++;
            }
        }
        clients = c;

        console.log('Number of clients: ' + numClients)

        console.log('The client has disconnected!');
    });

    //clients.push(socket);
    //console.log('Number of clients: ' + clients.length)

});

// Add a disconnect listener
io.sockets.on('disconnect',function() {
    console.log('The client has disconnected!');
});
