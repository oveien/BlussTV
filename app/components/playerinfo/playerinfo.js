(function (angular) {
    var app = angular.module('blussTV');
    app.controller('playerInfoController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.showing = false;
        $scope.players = [];
        $scope.teamShowing = false;
        $scope.currentPlayer = null;

        $scope.homeTeam = GameService.getTeam('home');
        $scope.awayTeam = GameService.getTeam('away');

        $scope.toggleShowTeam = function (team) {
            var team = GameService.getTeam(team);

            if (team.name == $scope.teamShowing.name) {
                $scope.players = [];
                $scope.teamShowing = false;
                return;
            }

            $scope.teamShowing = team;
            var players = [];
            for (var i in $scope.teamShowing.players) {
                if (!$scope.teamShowing.players[i].deleted) {
                    players.push($scope.teamShowing.players[i])
                }
            }
            $scope.players = players;
        }


        $scope.selectPlayer = function (player) {
            $scope.currentPlayer = player;
            $scope.currentPlayer.team = {
                logo: $scope.teamShowing.logo,
                name: $scope.teamShowing.name
            };

            $scope.teamShowing = false;
            $scope.players = [];
        }

        $scope.toggleShowPlayer = function () {
            if (CasparCGService.getCurrentOverlay() == 'player-info') {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = 'player-info';

                CasparCGService.runOverlay('player-info', $scope.currentPlayer);
            }
        }

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {

            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'player-info' && data.template != 'player-info') {
                $scope.showing = false;
            }
            else {
                $scope.showing = data.template;
            }

        });

    }]);
})(window.angular);