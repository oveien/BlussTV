// Hack, get game-code from url:
var m = window.location.pathname.match(/^\/game\/([^\/]+)/);
var gameCode = null;
if (m) {
    gameCode = m[1];
}

// Setup a socket to send if no caspar:
var socket = io.connect("/");

angular.module('services', [])
    .factory('BlussTVService', ['$http', '$q', function ($http, $q) {
        var f = {};


        f.getLivePoengligaMatches = function () {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/poengliga-matches'
            }).then(function (response) {
                var games = response.data;

                deferred.resolve(games);

            }, function () {
                deferred.resolve([]);
            });

            return deferred.promise;
        };

        f.getLiveDataVolleyMatches = function () {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/datavolley/current-matches'
            }).then(function (response) {
                var games = response.data;

                deferred.resolve(games);

            }, function () {
                deferred.resolve([]);
            });

            return deferred.promise;
        }

        f.getNormalizedStringCompare = function (teamName) {
            var sortParts = teamName.split(/\//);

            // Sort the parts, for beach so we get it saved as the same person first:
            sortParts.sort();
            teamName = sortParts.join("_");
            return teamName.replace(/\//g, "_").replace(/\s+/g, '').toLowerCase();
        }

        f.getImagesByTeamName = function (teamName) {
            var deferred = $q.defer();

            teamName = f.getNormalizedStringCompare(teamName);

            //teamName = "veiensvenby";


            var url = $.cloudinary.url(teamName, {format: 'json', type: 'list'});


            $.getJSON(url)
                .done(function (data) {

                    deferred.resolve(data.resources);


                })
                .fail(function () {

                }).always(function () {
                deferred.resolve([]);
            });

            return deferred.promise;
        };


        f.getAllTeams = function () {
            var deferred = $q.defer();

            // Might be async in the future:
            var teams = [
                {
                    'name': 'Asker',
                    'logo': 'asker.svg'
                },
                {
                    'name': 'Askim',
                    'logo': 'askim.svg'
                },
                {
                    'name': 'Austrått',
                    'logo': 'austratt.svg'
                },
                {
                    'name': 'BK Tromsø',
                    'logo': 'bktromso.svg'
                },
                {
                    'name': 'Blindheim',
                    'logo': 'blindheim.svg'
                },
                {
                    'name': 'Blussuvoll',
                    'logo': 'blussuvoll.svg'
                },
                  {
                    'name': 'Breimsbygda',
                    'logo': 'breimsbygda.svg'
                  },
                {
                    'name': 'Bodø',
                    'logo': 'bodo.svg'
                },
                {
                    'name': 'BSI',
                    'logo': 'bsi.svg'
                },
                {
                    'name': 'Dristug',
                    'logo': 'dristug.svg'
                },
                {
                    'name': 'Egersund',
                    'logo': 'egersund.svg'
                },
                {
                    'name': 'Førde VBK',
                    'logo': 'forde.svg'
                },
                {
                    'name': 'Gneist',
                    'logo': 'gneist.svg'
                },
                {
                    'name': 'Haugesund',
                    'logo': 'haugesund.svg'
                },
                {
                    'name': 'Holstad',
                    'logo': 'holstad.svg'
                },
                {
                    'name': 'KFUM Stavanger',
                    'logo': 'kfumstavanger.svg'
                },
                {
                    'name': 'Kolbotn',
                    'logo': 'kolbotn.svg'
                },
                {
                    'name': 'Koll',
                    'logo': 'koll.svg'
                },
                {
                    'name': 'KSK',
                    'logo': 'ksk.svg'
                },
                {
                    'name': 'Lierne',
                    'logo': 'lierne.svg'
                },
                {
                    'name': 'NTNUI',
                    'logo': 'ntnui.svg'
                },
                {
                    'name': 'Øksil',
                    'logo': 'oksil.svg'
                },
                {
                    'name': 'OSI',
                    'logo': 'osi.svg'
                },
                {
                    'name': 'Oslo volley',
                    'logo': 'oslovolley.svg'
                },
                {
                    'name': 'Randaberg',
                    'logo': 'randaberg.svg'
                },
                {
                    'name': 'Sandes',
                    'logo': 'sandnes.svg'
                },
                {
                    'name': 'Sarpsborg',
                    'logo': 'sarpsborg.svg'
                },
                {
                    'name': 'Spirit Lørenskog',
                    'logo': 'spiritlorenskog.svg'
                },
                {
                    'name': 'Stod Volley',
                    'logo': 'stod.svg'
                },
                {
                    'name': 'Strand-Ulv',
                    'logo': 'strandulv.svg'
                },
                {
                    'name': 'Sunnfjord',
                    'logo': 'sunnfjord.svg'
                },
                {
                    'name': 'Svelgen',
                    'logo': 'svelgen.svg'
                },
                {
                    'name': 'TBK',
                    'logo': 'tbk.svg',
                },
                {
                    'name': 'Tønsberg',
                    'logo': 'tonsberg.svg'
                },
                {
                    'name': 'Topp Volley',
                    'logo': 'tvn.svg'
                },
                {
                    'name': 'Vestli',
                    'logo': 'vestli.svg'
                },
                {
                    'name': 'Viking',
                    'logo': 'viking.svg'
                },
                {
                    'name': 'KFUM Volda',
                    'logo': 'volda.svg'
                }
            ];

            // Blæh, add base:
            for (var i in teams) {
                teams[i].logo = '/graphics/logo/' + teams[i].logo;
            }

            deferred.resolve(teams);

            return deferred.promise;
        }

        return f;
    }])

    .factory('GameService', ['$http', '$q', 'BlussTVService', function ($http, $q, BlussTVService) {


        var scoreBoardUpdateTime = 8;
        var game = null;

        var currentScore = {};
        var currentLineUp = {
            homeTeam: ["", "", "", "", "", ""],
            awayTeam: ["", "", "", "", "", ""],
        };

        var f = {};

        var createGameId = function () {
            var text = "";
            var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        };

        var updateScore = function () {
            console.log(game);
            if (!game || (!game.poengligaGameUrl && !game.dataVolley) ) {
                setTimeout(updateScore, scoreBoardUpdateTime*1000);
                return;
            }

            var url = '/update-score';

            if (game.dataVolley) {
                url = '/datavolley/NVBF/' + game.dataVolley.matchId + '/update-score';
            }

            $http({
                method: 'GET',
                url: url,
                params: {url: game.poengligaGameUrl}
            }).then(function (response) {
                var score = response.data;

                if (typeof(score) == "object" && JSON.stringify(currentScore) != JSON.stringify(score)) {

                    try {
                        currentScore = score;

                        console.log(score);
                        for (var i in score.homeTeam.players) {
                            var pl = score.homeTeam.players[i];
                            var p = f.getPlayerByNumber('home', pl.number);
                            if (p) {
                                p.ace = pl.ace;
                                p.blocks = pl.blocks;
                                p.attack = pl.attack;
                            }
                        }

                        for (var i in score.awayTeam.players) {
                            var pl = score.awayTeam.players[i];
                            var p = f.getPlayerByNumber('away', pl.number);
                            if (p) {
                                p.ace = pl.ace;
                                p.blocks = pl.blocks;
                                p.attack = pl.attack;
                            }
                        }
                        notifyObservers('score-update');
                        if (score.homeTeam.lineup) {
                            var newLineup = {homeTeam: score.homeTeam.lineup, awayTeam: score.awayTeam.lineup};
                            console.log(newLineup);
                            if (JSON.stringify(currentLineUp) != JSON.stringify(newLineup)) {
                                currentLineUp = newLineup;
                                notifyObservers('lineup-update');
                            }
                        }
                    }
                    catch (err) {
                        // Hopefully a new iteration will fix this
                    }
                }

                setTimeout(updateScore, scoreBoardUpdateTime*1000);
            }, function () {
                setTimeout(updateScore, scoreBoardUpdateTime*1000);
            });

        }

        setTimeout(updateScore, 5000);

        var observerCallbacks = [];
        var f = {};

        f.updatePlayersFromServer = function () {
            if (!game) {
                return false;
            }
            console.log(game);
            $http({
                method: 'GET',
                url: '/datavolley/NVBF/' + game.dataVolley.matchId + '/game-info',
            }).then(function (response) {
                console.log(response.data);


                game.homeTeam.players = response.data.homeTeam.players;
                game.awayTeam.players = response.data.awayTeam.players;
                notifyObservers('players-update');


            }, function (err) {
                alert('reject', err);
                deferred.reject(err);
            });
        }


        //register an observer
        f.registerObserverCallback = function(type, callback){
            if (typeof type === 'string') {
                type = [type];
            }

            for (var i in type) {
                observerCallbacks.push({type: type[i], callback: callback});
            }
        };

        //call this when you know 'foo' has been changed
        var notifyObservers = function(type, data) {
            angular.forEach(observerCallbacks, function(observer) {
                console.log(type);
                console.log(observer.type);
                if (observer.type == type) {
                    observer.callback(type, data);
                }
            });
        };


        f.setCurrentScore = function (score) {
            currentScore = score;
            notifyObservers('score-update');
        }

        f.getCurrentScore = function () {
            return currentScore;
        };

        f.newGame = function (url) {
            game = null;
            f.createNewGame({poengligaGameUrl: url}).then ( function () {
                document.location.reload();
            });
        };

        f.getCurrentLineup = function () {
            return currentLineUp;
        }

        f.getGameType = function () {
            if (game) {
                return game.type;
            }
            else {
                return null;
            }
        }

        f.getGameTournament = function () {
            if (game) {
                return game.tournament;
            }
            else {
                return null;
            }
        }



        // Dummy functions:
        f.createNewGame = function (options) {
            var deferred = $q.defer();

            game = null;
            var gameDefaults = {
                gameCode: createGameId(),
                tournament: 'NM',
                homeTeam: {
                    name: '',
                    logo: '',
                    players: [],
                    coach1: '',
                    coach2: '',
                },
                awayTeam: {
                    name: '',
                    logo: '',
                    players: [],
                    coach1: '',
                    coach2: '',
                },
                setPoints: [25, 25, 25, 25, 15],
                manualScore: true,
                type: 'indoor-volleyball',
                referees: {
                    mainRef: '',
                    secondRef: ''
                },
                commentators: {
                    commentator: '',
                    expert: ''
                }
            };


            // Deprecated :p
            if (options && options.poengligaGameUrl) {
                f.getGameInfo(options).then ( function (data) {
                    console.log(data);
                    data.manualScore = false;

                    angular.extend(gameDefaults, data);

                    game = gameDefaults;

                    // This is not extended?
                    game.homeTeam.jersey = {
                        player: 'red',
                        libero: 'black'
                    };

                    game.awayTeam.jersey = {
                        player: 'blue',
                        libero: 'red'
                    };
                    game.setPoints = [25, 25, 25, 25, 15];
                    game.manualScore = false;
                    game.url = options.poengligaGameUrl;
                    game.poengligaGameUrl = options.poengligaGameUrl;
                    game.gameCode = createGameId();

                    // We rather have the svg
                    BlussTVService.getAllTeams().then( function (teams) {
                        for (var i in teams) {
                            console.log(teams[i].name + ' vs ' + game.homeTeam.name);
                            if (teams[i].name == game.homeTeam.name) {
                                game.homeTeam.logo = teams[i].logo;
                            }
                            if (teams[i].name == game.awayTeam.name) {
                                game.awayTeam.logo = teams[i].logo;
                            }
                        }

                        f.saveChanges(game);
                        deferred.resolve(game);
                    });
                });
            }
            else if (options && options.dataVolley) {
                f.getGameInfo(options).then ( function (data) {

                    if (!data) {
                        deferred.resolve(null);
                        return;
                    }

                    angular.extend(gameDefaults, data);

                    game = gameDefaults;

                    // This is not extended?
                    game.homeTeam.jersey = {
                        player: 'red',
                        libero: 'black'
                    }

                    game.homeTeam.coach1 = "";
                    game.homeTeam.coach2 = "";

                    game.awayTeam.jersey = {
                        player: 'blue',
                        libero: 'red'
                    }
                    game.awayTeam.coach1 = "";
                    game.awayTeam.coach2 = "";

                    game.setPoints = [25, 25, 25, 25, 15];
                    game.manualScore = false;
                    game.dataVolley = {
                        matchId: options.dataVolley.matchId,
                        fedCode: 'NVFB'
                    }
                    game.gameCode = createGameId();
                    game.tournament = 'Mizunoligaen';
                    game.referees = {
                        mainRef: '',
                            secondRef: ''
                    };
                    game.commentators = {
                        commentator: '',
                            expert: ''
                    };



                    f.saveChanges(game);
                    deferred.resolve(game);
                });
            }
            else {
                // Normal game:
                angular.extend(gameDefaults, options);

                game = gameDefaults;

                // This is not extended?
                game.homeTeam.jersey = {
                    player: 'red',
                    libero: 'black'
                };

                game.awayTeam.jersey = {
                    player: 'blue',
                    libero: 'red'
                };

                f.saveChanges(game);
                deferred.resolve(game);
            }
            return deferred.promise;;
        }

        f.getSetPoints = function () {
            if (game) {
                return game.setPoints;
            }
        };

        f.getManualScore = function () {
            if (game) {
                return game.manualScore;
            }
        }

        f.getGameInfo = function (options) {

            var deferred = $q.defer();

            if (!options) {
                if (game) {
                    deferred.resolve(game);
                    return deferred.promise;
                }
            }

            if (options.dataVolley) {

                if (game) {
                    deferred.resolve(game);
                    return deferred.promise;
                }

                $http({
                    method: 'GET',
                    url: '/datavolley/NVBF/'+options.dataVolley.matchId+'/game-info',
                }).then(function (response) {
                    console.log(response.data);

                    if (response.data == 'null') {
                        response.data = null;
                    }

                    deferred.resolve(response.data);
                    notifyObservers('game-info');

                    // HACK HACK HACK, just reload the page to get the new info :D
                    //document.location.reload();


                }, function (err) {
                    alert('reject', err);
                    deferred.reject(err);
                });
            }
            else {


                if (game) {
                    deferred.resolve(game);
                    return deferred.promise;
                }
                gameUrl = options.poengligaGameUrl
                if (!gameUrl && game) {
                    gameUrl = game.poengligaGameUrl;
                }
                else if (!gameUrl && !game) {
                    gameUrl = 'http://www.poengliga.no/eliteh/1617/kamper/9web.html';
                }

                $http({
                    method: 'GET',
                    url: '/game-info',
                    params: {url: gameUrl}
                }).then(function (response) {

                    deferred.resolve(response.data);

                    notifyObservers('game-info');

                    // HACK HACK HACK, just reload the page to get the new info :D
                    // document.location.reload();


                }, function (err) {
                    deferred.reject(err);
                });
            }
            return deferred.promise;
        };

        f.getType = function () {
            if (game) {
                return game.type;
            }
        }

        f.getTeamName = function (team) {
            if (!game) {
                return;
            }
            if (team == 'home') {
                return game.homeTeam.name;
            }
            else {
                return game.awayTeam.name;
            }
        };

        f.setTeamData = function (team, data) {
            if (!game) {
                return;
            }
            if (team == 'home') {
                game.homeTeam = data;
            }
            else {
                game.awayTeam = data;
            }


            f.saveChanges (game);
        }

        f.getTeam = function (team) {
            if (!game) {
                return;
            }
            if (team == 'home') {
                return game.homeTeam;
            }
            else {
                return game.awayTeam;
            }
        }

        f.getPlayerByNumber = function (team, number) {
            if (!game) {
                return;
            }
            if (team == 'home') {
                players = game.homeTeam.players;
            }
            else {
                players = game.awayTeam.players;
            }

            for (var i in players) {
                if (!players[i].deleted && players[i].number == number) {
                    return players[i];
                }
            }
            return null;
        };

        f.getPlayerByName = function (team, name) {
            if (!game) {
                return;
            }
            if (team == 'home') {
                players = game.homeTeam.players;
            }
            else {
                players = game.awayTeam.players;
            }

            for (var i in players) {
                if (!players[i].deleted && players[i].name == name) {
                    console.log('Found player');
                    return players[i];
                }
            }
            return null;
        };

        f.saveChanges = function (g) {
            game = g;

            console.log(g);
            f.setStoredValue('game', game);
        };


        f.getStoredValue = function (key) {
            var item = localStorage.getItem(key);
            if (!item) {
                return null;
            }
            return JSON.parse(item);
        };

        f.setStoredValue = function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        };

        f.addPlayerPicture = function(playerId, url) {
            game.homeTeam.players.forEach(player => {
                if(player.id === playerId) {
                    player.image = url;
                }
            });

            game.awayTeam.players.forEach(player => {
                if(player.id === playerId) {
                player.image = url;
            }
        });

            f.setStoredValue('game', game);
        }

        game = f.getStoredValue('game');


        return f;

    }])

    .factory('CasparCGService', ['$http', '$q', function ($http, $q) {
        var f = {};
        var currentOverlay = "";

        var tvWindow = null;
        var hasCaspar = false;


        var getPreviewWindow = function (url) {
            var deferred = $q.defer();
                if ((tvWindow == null) || (tvWindow.closed)  )
                {
                    tvWindow = window.open(url,'TV','height=1080,width=1920');
                    tvWindow.addEventListener('load', function () {

                        tvWindow.getOnWebSocketConnect( function () {
                            deferred.resolve(tvWindow);
                        });
                    }, true);

                }
            else {
                    console.log('No reload needed');
                    deferred.resolve(tvWindow);
                }

            return deferred.promise;

        }

        var updateWindow = function (template, action, data) {
            // Send as a websocket message:
            socket.send(JSON.stringify({gameCode: gameCode, template: template, action: action, data: {data: data}}));
        }

        var observerCallbacks = [];
        var f = {};

        f.getHtmlOverlayUrl = function () {
            return window.location.protocol + '//' + window.location.host + '/game/' + gameCode + '/overlay';
        }

        //register an observer
        f.registerObserverCallback = function(type, callback){
            if (typeof type === 'string') {
                type = [type];
            }
            for (var i in type) {
                console.log(type[i]);
                observerCallbacks.push({type: type[i], callback: callback});
            }
        };

        //call this when you know 'foo' has been changed
        var notifyObservers = function(type, data) {
            console.log('Letting you know of ' + type);
            angular.forEach(observerCallbacks, function(observer) {
                if (observer.type == type) {
                    console.log('Letting people know of ' + type);
                    observer.callback(type, data);
                }
            });
        };

        f.playStream = function (stream) {
            $.post('/caspar/play-stream/', {stream: stream}, function () {
            });
        }

        f.runOverlay = function (template, data) {
            console.log(data);


            if (currentOverlay) {
                currentOverlay = template;

                if (hasCaspar) {
                    // Give the current overlay a chance to exit:
                    $.post('/caspar/templates/' + template + '/remove', {}, function () {
                        $.post('/caspar/templates/' + template + '/play', {data: data}, function () {

                        });
                    });
                }
                else {
                    getPreviewWindow('/game/' + gameCode + '/overlay').then ( function () {
                        updateWindow(template, 'remove', data);
                        updateWindow(template, 'play', data);
                    });
                }
            }
            else {

                currentOverlay = template;

                if (hasCaspar) {
                    $.post('/caspar/templates/' + template + '/play', {data: data}, function () {

                    });
                }
                else {
                    console.log(data);
                     getPreviewWindow('/game/' + gameCode + '/overlay').then ( function (w) {
                        updateWindow(template, 'play', data);
                    });
                }
            }

            notifyObservers('overlay-play', {template: template});

        }

        f.removeOverlay = function (template, data) {
            currentOverlay = "";
            if (hasCaspar) {
                $.post('/caspar/templates/' + template + '/remove', {data: data}, function () {
                });
            }
            else {
                console.log(data);
                getPreviewWindow('/game/' + gameCode + '/overlay').then ( function (w) {
                    updateWindow(template, 'remove', data);
                });
            }

            notifyObservers('overlay-remove');
        }

        f.updateOverlay = function (template, data) {
            if (template != currentOverlay) {
                return;
            }

            if (hasCaspar) {
                $.post('/caspar/templates/' + template + '/update', {data: data}, function () {
                });
            }
            else {
                getPreviewWindow('/game/' + gameCode + '/overlay').then ( function (w) {
                    updateWindow(template, 'update', data);
                });
            }
        }

        f.getCurrentOverlay = function () {
            return currentOverlay;
        }

        return f;
    }]);
