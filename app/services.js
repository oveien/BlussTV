
angular.module('services', [])
    .factory('GameService', ['$http', '$q', function ($http, $q) {


        var scoreBoardUpdateTime = 20;

        var game = null;



        var currentScore = {};

        var f = {};


        var updateScore = function () {
            if (!game) {
                setTimeout(updateScore, scoreBoardUpdateTime*1000);
                return;
            }

            $http({
                method: 'GET',
                url: '/update-score',
                params: {url: game.url}
            }).then(function (response) {
                var score = response.data;

                if (!Object.equals(score, currentScore)) {
                    currentScore = score;

                    notifyObservers('score-update');
                }

                setTimeout(updateScore, scoreBoardUpdateTime*1000);
            }, function () {
                setTimeout(updateScore, scoreBoardUpdateTime*1000);
            });

        }

        setTimeout(updateScore, 5000);

        var observerCallbacks = [];
        var f = {};
        //register an observer
        f.registerObserverCallback = function(type, callback){
            observerCallbacks.push({type: type, callback: callback});
        };

        //call this when you know 'foo' has been changed
        var notifyObservers = function(type) {
            angular.forEach(observerCallbacks, function(observer) {
                if (observer.type == type) {
                    observer.callback();
                }
            });
        };


        f.getCurrentScore = function () {
            return currentScore;
        };

        f.newGame = function (url) {
            game = null;

            f.getGameInfo(url);
        }

        f.getGameInfo = function (gameUrl) {


            var deferred = $q.defer();

            if (game) {
                deferred.resolve(game);
                return deferred.promise;
            }

            if (!gameUrl && game) {
                gameUrl = game.url;
            }
            else if (!gameUrl && !game) {
                gameUrl = 'http://www.poengliga.no/eliteh/1617/kamper/9web.html';
            }

            $http({
                method: 'GET',
                url: '/game-info',
                params: {url: gameUrl}
            }).then(function (response) {

                // Need to update the templates to get the menu updated :/

                game = response.data;

                game.url = gameUrl;

                f.saveChanges(game);
                deferred.resolve(response.data);

                notifyObservers('game-info');

                // HACK HACK HACK, just reload the page to get the new info :D
                document.location.reload();


            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

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
                if (players[i].number == number) {
                    return players[i];
                }
            }
            return null;
        };

        f.saveChanges = function (g) {
            game = g;

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

        game = f.getStoredValue('game');

        return f;

    }])

    .factory('CasparCGService', ['$http', '$q', function ($http, $q) {
        var f = {};
        var currentOverlay = "";

        var tvWindow = null;
        var hasCaspar = false;


        var getPreviewWindow = function (url) {

                if ((tvWindow == null) || (tvWindow.closed)  )
                {
                    tvWindow = window.open(url,'TV','height=720,width=1280');
                }
                return tvWindow;
        }

        var updateWindow = function (win, data) {
            if (win && win.closed) {
                return false;
            }

            if (typeof win.update === 'function') {
                win.update(JSON.stringify({data: data}));
                return;
            }

            setTimeout(function () {
                updateWindow(win, data);
            }, 200);

        }

        var observerCallbacks = [];
        var f = {};
        //register an observer
        f.registerObserverCallback = function(type, callback){
            observerCallbacks.push({type: type, callback: callback});
        };

        //call this when you know 'foo' has been changed
        var notifyObservers = function(type) {
            angular.forEach(observerCallbacks, function(observer) {
                if (observer.type == type) {
                    observer.callback();
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
                    var w = window.open('/templates/' + template + '/', 'TV', 'height=720,width=1280');
                    updateWindow(w, data);
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
                    var w = getPreviewWindow('/templates/' + template + '/');
                    updateWindow(w, data);
                }
            }



        }

        f.removeOverlay = function (template, data) {
            currentOverlay = "";
            $.post('/caspar/templates/' + template + '/remove', {data: data}, function () {
            });
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
                var w = getPreviewWindow('/templates/' + template + '/');
                updateWindow(w, data);
            }
        }

        f.getCurrentOverlay = function () {
            return currentOverlay;
        }

        return f;
    }]);
