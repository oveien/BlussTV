(function (angular) {
    var app = angular.module('blussTV');
    app.controller('beachTeamController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.showing = false;

        $scope.homeTeam = GameService.getTeam('home');
        $scope.awayTeam = GameService.getTeam('away');

        $scope.toggleTeamsSquad = function (team) {
            if (CasparCGService.getCurrentOverlay() == 'beach-team' && team == $scope.showing) {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {

                $scope.showing = team;

                var team = GameService.getTeam(team);

                var d = {};
                d.name = team.name;
                d.logo = team.logo;
                d.players = [];

                for (var i in team.players) {
                    if (!team.players[i].deleted) {
                        d.players.push(team.players[i]);
                    }
                }

                console.log(d.players);

                CasparCGService.runOverlay('beach-team', d);
            }
        }

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {
            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'beach-team') {
                $scope.showing = false;
            }

        });


    }]);





})(window.angular);