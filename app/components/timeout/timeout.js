(function (angular) {
    var app = angular.module('blussTV');
    app.controller('timeOutController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.showing = false;
        $scope.who = "";

        $scope.homeTeam = GameService.getTeam('home');
        $scope.awayTeam = GameService.getTeam('away');

        $scope.gameType = GameService.getType();

        $scope.toggleTimeout = function (who) {
            $scope.who = who;
            if (CasparCGService.getCurrentOverlay() == 'timeout') {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = true;

                var ht = GameService.getTeam('home');
                var at = GameService.getTeam('away');

                var setsHomeTeam = null;
                var setsAwayTeam = null;
                var gs = GameService.getCurrentScore();
                console.log(gs);
                if (gs.homeTeam) {
                    setsHomeTeam = gs.homeTeam.setPoints;
                    setsAwayTeam = gs.awayTeam.setPoints;
                }
                GameService.getGameInfo().then ( function (game) {
                    console.log(game);
                    var data = {
                        homeTeam: {
                            logo: ht.logo,
                            name: ht.name,
                            gameSets: setsHomeTeam
                        },
                        awayTeam: {
                            logo: at.logo,
                            name: at.name,
                            gameSets: setsAwayTeam
                        },
                        gameType: GameService.getGameType(),
                        who: who,

                    }

                    console.log(JSON.stringify(data));
                    CasparCGService.runOverlay('timeout', data);
                });
            }
        }

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {

            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'timeout') {
                $scope.showing = false;
            }

        });

    }]);
})(window.angular);