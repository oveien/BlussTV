require('dotenv').load();

var CasparCG = require('caspar-cg');
ccg = new CasparCG('127.0.0.1', 5250);

var express = require('express');
var router = express.Router();

var fs = require('fs');

var iconvlite = require('iconv-lite');
var bodyParser = require('body-parser');
var sanitize = require('sanitize-filename');
var io = require('socket.io');
var http = require('http');

var formidable = require('formidable');

var app = express();
var path = require('path');

var ffdevices = require('ffdevices');

var DataVolley = require('./lib/datavolley');

console.log(__dirname);

const PORT = process.env.PORT || 3000;

app.get('/init.js', function(req, res) {
    var config = {
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
        },
    };

    var output = 'window.CONFIG = ' + JSON.stringify(config) + ';';

    output +=
        'jQuery.cloudinary.config({ cloud_name: CONFIG.cloudinary.cloudName, api_key: CONFIG.cloudinary.apiKey});';
    res.send(output);
});

router.get('/datavolley/:fedCode/:gameId/update-score', function(req, res) {
    var match = DataVolley.Match.getInstance(
        req.params.fedCode,
        req.params.gameId
    );

    match
        .getGameInfo(true)
        .then(function(data) {
            res.send(JSON.stringify(data));
        })
        .catch(function() {
            console.log('Error!');
            res.send(JSON.stringify(null));
        });
});

router.get('/datavolley/:fedCode/:gameId/game-info', function(req, res) {
    var match = DataVolley.Match.getInstance(
        req.params.fedCode,
        req.params.gameId
    );

    match
        .getGameInfo()
        .then(function(data) {
            console.log('Get game info');
            console.log(data);
            res.send(JSON.stringify(data));
        })
        .catch(function(err) {
            console.log('Error!');
            res.send(JSON.stringify(null));
        });
});

router.get('/datavolley/current-matches', function(req, res) {
    var ml = new DataVolley.MatchList();
    ml.getCurrentMatches().then(function(games) {
        res.send(JSON.stringify(games));
    });
});

router.post('/caspar/play-stream', function(req, res) {
    //
    ccg.connect(function() {
        console.log('Connected to Caspar-server');
        var addCommand = 'PLAY 1-1 "' + req.body.stream + '"';

        console.log(addCommand);
        ccg.sendCommand(addCommand, function() {
            res.send('Command was sent');

            ccg.disconnect();
        });
    });
});

router.post('/caspar/templates/:template/:what', function(req, res) {
    //
    console.log('Loading template: ' + req.params.template);
    ccg.connect(function() {
        console.log('Connected to Caspar-server');

        if (req.params.what == 'play') {
            var path = `http://127.0.0.1:${PORT}/templates/${
                req.params.template
            }`;
            var addCommand = 'PLAY 1-11 [HTML] "' + path + '"';

            console.log('Loading ' + path);

            var updateCommand =
                'CALL 1-11 UPDATE ' +
                JSON.stringify(JSON.stringify(req.body)) +
                '';
            ccg.sendCommand(addCommand, function() {
                ccg.sendCommand(updateCommand, function() {
                    console.log('Command was sent');

                    ccg.disconnect();

                    res.send('Command was sent');
                });
            });
        } else if (req.params.what == 'remove') {
            var removeCommand = 'CALL 1-11 REMOVE ""';
            ccg.sendCommand(removeCommand, function() {
                console.log('Ran remove');
                res.send('Command was sent');
                ccg.disconnect();
            });
        } else if (req.params.what == 'update') {
            var updateCommand =
                'CALL 1-11 UPDATE ' +
                JSON.stringify(JSON.stringify(req.body)) +
                '';
            console.log(updateCommand);
            ccg.sendCommand(updateCommand, function() {
                console.log('Ran update');
                res.send('Command was sent');
                ccg.disconnect();
            });
        }
    });
});

router.get('/directshow/devices', function(req, res) {
    //
    //ffdevices.ffmpegPath = path.dirname(__dirname) + '/ffmpeg//bin/ffmpeg.exe'
    console.log(path.dirname(__dirname) + '/bin/ffmpeg/ffmpeg.exe');
    ffdevices.getAll(function(error, devices) {
        console.log(error);
        if (!error) {
            devices.push({
                name: 'NTNUI - Førde',
                deviceType: 'file',
                path: 'NTNUI - Førde.mp4',
            });
            res.send(JSON.stringify(devices));
        } else {
            res.send(JSON.stringify({ error: true }));
        }
    });
});

router.get('/graphics/:club/players/:id/image', function(req, res) {
    //
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

app.route('/upload-profile-image').post(function(req, res, next) {
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/tmp/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    var ulPath = '';
    form.on('file', function(field, file) {
        ulPath = file.path;
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log(
            '<script>alert("An error has occured: \n' + err + '");</script>'
        );
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
            destPath += sanitize(data.player_sid) + '.jpg';
            console.log('Writing ' + destPath);
            fs.rename(ulPath, destPath);
        }
        res.end("<script>alert('Added image');</script>");
    });

    // parse the incoming request containing the form data
    form.parse(req);
});

router.get('/graphics/:club/logo.jpg', function(req, res) {
    //
    var safeClubName = sanitize(req.params.club);

    var clubDir = __dirname + '/data/' + safeClubName;
    var filename = clubDir + '/logo.jpg';

    var svgFilename =
        __dirname + '/app/graphics/logo/' + safeClubName.toLowerCase() + '.svg';
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
app.use(
    '/lib/bootstrap',
    express.static(__dirname + '/node_modules/angular-ui-bootstrap/dist/')
);
app.use(
    '/lib/bootstrap',
    express.static(__dirname + '/node_modules/bootstrap/dist/css/')
);
app.use(
    '/lib',
    express.static(__dirname + '/node_modules/socket.io-client/dist/')
);

app.get('/game/:gameId/control', function(req, res) {
    res.sendFile('game/index.html', { root: './app' });
});

app.get('/game/:gameId/app.js', function(req, res) {
    res.sendFile('game/app.js', { root: './app' });
});

app.get('/game/:gameId/overlay', function(req, res) {
    res.sendFile('obs/index.html', { root: './app' });
});

app.use('/', router);

app.use('*', function(req, res) {
    res.sendFile(__dirname + '/app/404.html');
});

/*
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
*/

var server = http.createServer(app).listen(PORT);

var clients = {};
io = io.listen(server);
io.sockets.on('connection', function(socket) {
    /*Associating the callback function to be executed when client visits the page and
     websocket connection is made */

    var message_to_client = {
        status: 'connected',
        data: 'Connection with the server established',
    };

    socket.send(JSON.stringify(message_to_client));
    /*sending data to the client , this triggers a message event at the client side */
    console.log('Socket.io Connection with the client established');
    socket.on('message', function(data) {
        /*This event is triggered at the server side when client sends the data using socket.send() method */
        data = JSON.parse(data);

        console.log(data);
        /*Printing the data */
        var ack_to_client = {
            data: 'Server Received the message',
        };

        if (data.action == 'add_client') {
            console.log(data.data.gameCode);
            if (!data.data.gameCode) {
                return;
            }

            if (typeof clients[data.data.gameCode] == 'undefined') {
                console.log('Setting client to game code');
                clients[data.data.gameCode] = [];
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

    socket.on('disconnect', function(d1, d2) {
        var c = {};
        var numClients = 0;
        for (var gameCode in clients) {
            for (var i in clients[gameCode]) {
                if (clients[gameCode][i].conn.id == this.conn.id) {
                    continue;
                }
                if (typeof c[gameCode] == 'undefined') {
                    c[gameCode] = [];
                }
                c[gameCode].push(clients[gameCode][i]);
                numClients++;
            }
        }
        clients = c;

        console.log('Number of clients: ' + numClients);

        console.log('The client has disconnected!');
    });

    //clients.push(socket);
    //console.log('Number of clients: ' + clients.length)
});

// Add a disconnect listener
io.sockets.on('disconnect', function() {
    console.log('The client has disconnected!');
});
