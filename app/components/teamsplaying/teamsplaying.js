(function (angular) {
    var app = angular.module('blussTV');
    app.controller('teamsPlayingController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.showing = false;

        $scope.toggleTeamsPlaying = function () {
            if (CasparCGService.getCurrentOverlay() == 'teamsplaying') {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = true;
                var ht = GameService.getTeam('home');
                var at = GameService.getTeam('away');
                var data = {
                    homeTeam: {
                        logo: ht.logo,
                        name: ht.name
                    },
                    awayTeam: {
                        logo: at.logo,
                        name: at.name
                    },
                    gameType: GameService.getGameType(),
                    gameTournament: GameService.getGameTournament()

                }

                console.log(JSON.stringify(data));
                CasparCGService.runOverlay('teamsplaying', data);
            }
        }

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {

            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'teamsplaying') {
                $scope.showing = false;
            }

        });

    }]);
})(window.angular);