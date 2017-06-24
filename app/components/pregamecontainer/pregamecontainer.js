(function (angular) {
    var app = angular.module('blussTV');
    app.controller('preGameContainerController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.getGameType = function () {
            
            return GameService.getGameType();
        }

    }]);
})(window.angular);