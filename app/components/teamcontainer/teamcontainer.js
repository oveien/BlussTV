
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('teamContainerController', ['$scope',  'GameService', 'CasparCGService', function ($scope, GameService, CasparCGService) {
        var game = null;

        console.log ( GameService.getGameInfo() );
        GameService.getGameInfo().then( function (data) {
            game = data;
        });

        $scope.getTeamName = function (ha) {
            if (game) {
                if (ha == 'home') {
                    return game.homeTeam.name;
                }
                else {
                    return game.awayTeam.name;
                }
            }
        }

        $scope.getTeamLogo = function (ha) {
            if (game) {
                if (ha == 'home') {
                    return game.homeTeam.logo;
                }
                else {
                    return game.awayTeam.logo;
                }
            }
        };

        $scope.getTeamPlayers = function (ha) {
            if (game) {
                if (ha == 'home') {
                    return game.homeTeam.players;
                }
                else {
                    return game.awayTeam.players;
                }
            }
        }

        $scope.onChange = function () {
            GameService.saveChanges (game);
        }

        $scope.awayShowing = false;
        $scope.homeShowing = false;

        var currentTeamShowing = '';
        var updateShowing = function() {
            $scope.awayShowing = false;
            $scope.homeShowing = false;

            if (CasparCGService.getCurrentOverlay() == 'squad') {
                if (currentTeamShowing == "home") {
                    $scope.homeShowing = true;
                }
                if (currentTeamShowing == "away") {
                    $scope.awayShowing = true;
                }
            }
        }

        $scope.addPlayer = function (team) {

            var player = {
                name: ''
            }

            if (team == "home") {
                game.homeTeam.players.push(player);
            }
            else {
                game.awayTeam.players.push(player);
            }

            $scope.onChange();

        }

        $scope.toggleTeamShowing = function (team) {
            var data = null;
            if (team == 'home') {
                data = game.homeTeam;
            }
            else {
                data = game.awayTeam;
            }

            if (CasparCGService.getCurrentOverlay() == 'squad' && currentTeamShowing == team) {
                // The same team, remove it:
                CasparCGService.removeOverlay();
                currentTeamShowing = '';
            }
            else {
                currentTeamShowing = team;

                var d = {};
                d.name = data.name;
                d.players = [];

                for (var i in data.players) {
                    if (!data.players[i].deleted) {
                        d.players.push(data.players[i]);
                    }
                }

                CasparCGService.runOverlay('squad', d);
            }

            updateShowing();
        };

    }]);
})(window.angular);