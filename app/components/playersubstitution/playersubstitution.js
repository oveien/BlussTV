(function (angular) {
    var app = angular.module('blussTV');
    app.controller('playerSubstitutionController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.showing = false;
        $scope.players = [];
        $scope.teamShowing = false;
        $scope.currentPlayerIn = null;

        $scope.homeTeam = GameService.getTeam('home');
        $scope.awayTeam = GameService.getTeam('away');

        $scope.toggleShowTeam = function (team) {

            $scope.currentPlayerIn = $scope.currentPlayerOut = null;

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

            if (!$scope.currentPlayerIn) {
                $scope.currentPlayerIn = player;
                $scope.teamShowing = true;

                var p = [];
                for (var i in $scope.players) {
                    if ($scope.players[i] == player) {
                        continue;
                    }
                    p.push($scope.players[i]);
                }
                $scope.players = p;
            }
            else {
                $scope.currentPlayerOut = player;
                $scope.teamShowing = false;
                $scope.players = [];
            }

            $scope.currentPlayer = player;

            $scope.currentPlayerIn.team = {
                logo: $scope.teamShowing.logo,
                name: $scope.teamShowing.name
            };

        }

        $scope.toggleShowPlayer = function () {
            if (CasparCGService.getCurrentOverlay() == 'substitution') {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = 'substitution';

                var data = {
                    playerIn: $scope.currentPlayerIn,
                    playerOut: $scope.currentPlayerOut,
                    team: $scope.currentPlayerIn.team
                }

                CasparCGService.runOverlay('substitution', data);
            }
        }

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {

            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'substitution' && data.template != 'substitution') {
                $scope.showing = false;
            }
            else {
                $scope.showing = data.template;
            }

        });

    }]);
})(window.angular);