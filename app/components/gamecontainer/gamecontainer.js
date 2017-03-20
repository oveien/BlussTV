
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('gameController', ['$scope', '$http', 'GameService', function ($scope, $http, GameService) {
        $scope.getGameType = function () {
            return GameService.getGameType();
        }
    }]);
})(window.angular);