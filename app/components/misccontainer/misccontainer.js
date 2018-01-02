
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('miscController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.interviewee = [];

        var homeTeam = GameService.getTeam('home');
        var awayTeam = GameService.getTeam('away');

        $scope.interviewee.push({
            name: '',
            role: '',
            logo: null
        })

        $scope.interviewee.push({
            name: '',
            role: '',
            logo: null
        })

        $scope.showTwoPersons = false;

        $scope.showing = false;

        $scope.manualScore = false;

        $scope.logoOptions = [
            {
                name: 'No logo'
            },
            {
                name: homeTeam.name,
                path: homeTeam.logo
            },
            {
                name: homeTeam.name,
                path: awayTeam.logo
            },
            {
                name: 'Referee',
                path: '/graphics/icons/referee.png'
            },
            {
                name: 'Commentator',
                path: '/graphics/icons/microphone.png'
            }
        ];

        $scope.interviewee[0].logo = $scope.logoOptions[0];
        $scope.interviewee[1].logo = $scope.logoOptions[0];

        $scope.toggleShowing = function (what) {
            if (CasparCGService.getCurrentOverlay() == what) {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = 'interviewee';

                var data = {
                    'name1': $scope.interviewee[0].name,
                    'role1': $scope.interviewee[0].role,
                    'logo1': $scope.interviewee[0].logo.path
                };
                if ($scope.showTwoPersons) {
                    data.name2 = $scope.interviewee[1].name;
                    data.role2 = $scope.interviewee[1].role;
                    data.logo2 = $scope.interviewee[1].logo.path;
                }

                console.log($scope.interviewee);

                CasparCGService.runOverlay(what, data);
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