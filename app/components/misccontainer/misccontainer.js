
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('miscController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.intervieweeName = "";
        $scope.intervieweeRole = "";

        $scope.showing = false;

        $scope.manualScore = false;

        $scope.toggleShowing = function (what) {
            if (CasparCGService.getCurrentOverlay() == what) {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = 'interviewee';
                CasparCGService.runOverlay(what, {
                    'name': $scope.intervieweeName,
                    'role': $scope.intervieweeRole
                });
            }
        }

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {

            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'interviewee') {
                $scope.showing = false;
            }

        });

    }]);
})(window.angular);