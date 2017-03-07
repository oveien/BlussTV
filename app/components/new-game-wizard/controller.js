(function (angular) {
    var app = angular.module('blussTVFrontPage');

    app.filter('iif', function () {
        return function(input, trueValue, falseValue) {
            return input ? trueValue : falseValue;
        };
    });

    app.controller('newGameWizardController',  ['$scope', 'GameService', function ($scope, GameService) {
        var $ctrl = this;

        $scope.active = 0;
        $scope.numSteps = 3;
        $scope.gameType = 0;

        $scope.nextButtonText = 'Fortsett';

        $scope.gameTypes = [
            'Volleyball - Mizunoligaen/Poengliga',
            'Volleyball - 1. div og lavere',
            'Beachvolleyball'];


        $scope.eliteGames = [
            {
                'sex': 'm',
                'homeTeam': 'Førde',
                'awayTeam': 'NTNUI',
                'poengligaGameUrl': '',
                'title': 'Herrer: Førde - NTNUI'
            },
            {
                'sex': 'f',
                'homeTeam': 'OSI',
                'awayTeam': 'Randaberg',
                'poengligaGameUrl': '',
                'title': 'Damer: OSI - NTNUI'
            }
        ];

        $scope.eliteGame = $scope.eliteGames[0];

        var updateProgressWidth = function () {
            $scope.progressBarWidth = {
                width: ($scope.active+1)/$scope.numSteps*100 + '%'
            };
        }

        $scope.goToStep = function (n) {
            // If we're at the first step, add more:
            if ($scope.active == 0) {
                if ($scope.gameType == 0) {
                    $scope.numSteps = 2;
                }
            }

            $scope.active = n;
            updateProgressWidth();

            if ($scope.active == $scope.numSteps-1) {
                $scope.nextButtonText = 'Start kamp';
            }
            else {
                $scope.nextButtonText = 'Fortsett';
            }
        }

        $scope.nextStep = function () {
            // The last step?
            if ($scope.active + 1 == $scope.numSteps) {
                createNewGame ();
            }
            else {
                $scope.goToStep($scope.active + 1);
            }
        };

        $scope.close = function () {
            $ctrl.modalInstance.dismiss("cancel");
        }

        $scope.range = function(min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i < max; i += step) {
                input.push(i);
            }
            return input;
        };

        var createNewGame = function () {
            GameService.createNewGame({options: 'stuff'}).then ( function (gameData) {
              document.location.href = '/game/' + gameData.gameCode + '/control'
            });
        };



        updateProgressWidth();
    }]);
})(angular);