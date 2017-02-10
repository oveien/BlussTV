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
                    }
                }

                console.log(JSON.stringify(data));
                CasparCGService.runOverlay('teamsplaying', data);
            }
        }

    }]);
})(window.angular);