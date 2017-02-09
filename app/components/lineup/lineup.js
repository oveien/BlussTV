
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('lineupController', ['$scope', 'GameService', function ($scope, GameService) {


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