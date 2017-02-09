
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('scoreBoardController', ['$scope', '$http', 'GameService', function ($scope, $http, GameService) {
        $scope.showing = false;

        $scope.toggleShowing = function () {
            $scope.showing = !$scope.showing;
        }

        $scope.homeTeamName = GameService.getTeamName('home');
        $scope.awayTeamName = GameService.getTeamName('away');

        GameService.registerObserverCallback('game-info', function () {
            $scope.homeTeamName = GameService.getTeamName('home');
            $scope.awayTeamName = GameService.getTeamName('away');
        });

    }]);
})(window.angular);