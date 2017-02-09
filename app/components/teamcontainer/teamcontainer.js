
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('teamContainerController', ['$scope', '$http', 'GameService', function ($scope, $http, GameService) {
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

    }]);
})(window.angular);