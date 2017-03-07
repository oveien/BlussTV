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

        $scope.nextButtonText = 'Fortsett';

        $scope.gameTypes = [
            {
                id: 0,
                name: 'Volleyball - Mizunoligaen/Poengliga'
            },
            {
                id: 1,
                name: 'Volleyball - 1. div og lavere'
            },
            {
                id: 2,
                name: 'Beachvolleyball'
            }
        ];

        $scope.selectedGameType = $scope.gameTypes[0];

        $scope.onChange = function () {
            console.log($scope.selectedGameType.id);
        }

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

        $scope.lowerDivisionVolleyball = {
            homeTeam: {
                name: '',
                players: []
            },
            awayTeam: {
                name: '',
                players: []
            }
        }

        $scope.addPlayer = function (team, num) {
            if (!num) {
                num = 1;
            }
            for (var i = 0; i<num; i++) {
                if (team == 'home') {
                    $scope.lowerDivisionVolleyball.homeTeam.players.push({name: ''});
                }
                else {
                    $scope.lowerDivisionVolleyball.awayTeam.players.push({name: ''});
                }
            }
        }

        $scope.eliteGame = $scope.eliteGames[0];

        var updateProgressWidth = function () {
            $scope.progressBarWidth = {
                width: (($scope.active%10)+1)/$scope.numSteps*100 + '%'
            };
        }

        $scope.goToStep = function (n) {
            // If we're at the first step, add more:

            if ($scope.active == 0) {
                if ($scope.selectedGameType.id == 0) {
                    $scope.numSteps = 2;
                }
                if ($scope.selectedGameType.id == 1) {
                    $scope.numSteps = 3;
                    n = 21;
                    if ($scope.lowerDivisionVolleyball.homeTeam.players.length == 0 &&
                        $scope.lowerDivisionVolleyball.awayTeam.players.length == 0) {
                        $scope.addPlayer('home', 8);
                        $scope.addPlayer('away', 8);
                    }
                }
                if ($scope.selectedGameType.id == 2) {
                    $scope.numSteps = 2;
                    n = 31;

                    if ($scope.lowerDivisionVolleyball.homeTeam.players.length == 0 &&
                        $scope.lowerDivisionVolleyball.awayTeam.players.length == 0) {
                        $scope.addPlayer('home', 2);
                        $scope.addPlayer('away', 2);
                    }
                }
            }

            $scope.active = n;
            updateProgressWidth();

            if ($scope.active%10 == $scope.numSteps-1) {
                $scope.nextButtonText = 'Start kamp';
            }
            else {
                $scope.nextButtonText = 'Fortsett';
            }
        }

        $scope.nextStep = function () {
            // The last step?
            if (($scope.active % 10) + 1 == $scope.numSteps) {
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
            var data = $scope.lowerDivisionVolleyball;

            if ($scope.selectedGameType == 1) {
                data = {poengligaGameUrl: $scope.eliteGame.poengligaGameUrl};
            }

            GameService.createNewGame(data).then(function (gameData) {
                document.location.href = '/game/' + gameData.gameCode + '/control'
            });
        };



        updateProgressWidth();
    }]);
})(angular);