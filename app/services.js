
angular.module('services', [])
    .factory('GameService', ['$http', '$q', function ($http, $q) {

        var game = null;
        var f = {};

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


        f.getGameInfo = function () {
            var deferred = $q.defer();

            if (game) {
                deferred.resolve(game);
                return deferred.promise;
            }

            $http({
                method: 'GET',
                url: '/game-info',
                params: {url: 'http://www.poengliga.no/eliteh/1617/kamper/9web.html'}
            }).then(function (response) {

                // Need to update the templates to get the menu updated :/

                game = response.data;

                f.saveChanges(game);
                deferred.resolve(response.data);

                notifyObservers('game-info');
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

            if (currentOverlay) {
                currentOverlay = template;

                // Give the current overlay a chance to exit:
                $.post('/caspar/templates/' + template + '/remove', {}, function () {
                    $.post('/caspar/templates/' + template + '/play', {data: data}, function () {

                    });
                });
            }
            else {
                currentOverlay = template;
                $.post('/caspar/templates/' + template + '/play', {data: data}, function () {

                });
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

            $.post('/caspar/templates/' + template + '/update', {data: data}, function () {
            });
        }

        f.getCurrentOverlay = function () {
            return currentOverlay;
        }

        return f;
    }]);
