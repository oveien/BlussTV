(function (angular) {
    var app = angular.module('blussTVFrontPage');

    app.filter('iif', function () {
        return function(input, trueValue, falseValue) {
            return input ? trueValue : falseValue;
        };
    });

    app.controller('newGameWizardController',  ['$scope', 'GameService', 'BlussTVService', function ($scope, GameService, BlussTVService) {
        var $ctrl = this;

        $scope.active = 0;
        $scope.numSteps = 3;

        $scope.nextButtonText = 'Fortsett';

        $scope.pages = [0, 1];

        $scope.numSetsBeach = [
            {
                name: '3 set (2x21 + 1x15)',
                sets: [21, 21, 15]
            },
            {
                name: '3 set (3x15)',
                sets: [15, 15, 15]
            },
            {
                name: '1 set (1x21)',
                sets: [21]
            },
            {
                name: '1 set (1x15)',
                sets: [15]
            }
        ];

        $scope.currentBeachSets = $scope.numSetsBeach[0];


        $scope.numSetsIndoor = [
            {
                name: '5 set (4x25 + 1x15)',
                sets: [25, 25, 25, 25, 15]
            },
            {
                name: '3 set (2x25 + 1x15)',
                sets: [25, 25, 15]
            },
            {
                name: '1 set (1x25)',
                sets: [25]
            },
            {
                name: '1 set (1x15)',
                sets: [15]
            },
        ]

        $scope.currentIndoorSets = $scope.numSetsIndoor[0];


        $scope.selectedHomeTeam = null;
        $scope.selectedAwayTeam = null;
        $scope.allTeams = [];

        BlussTVService.getAllTeams().then ( function (teams) {
            $scope.allTeams = teams;
        });

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

        $scope.liveEliteGames = true;
        $scope.eliteGames = [
            {
                'homeTeam': 'BK Tromsø',
                'awayTeam': 'Viking',
                'poengligaGameUrl': 'http://www.poengliga.no/eliteh/1617/kamper/9web.html',
                'title': 'Herrer: BK Tromsø - Viking'
            },
            {
                'homeTeam': 'Randaberg',
                'awayTeam': 'Oslo Volley',
                'poengligaGameUrl': 'http://www.poengliga.no/elited/1617/kamper/10web.html',
                'title': 'Damer: Randaberg - Oslo Volley'
            }
        ];

        BlussTVService.getLivePoengligaMatches().then ( function (matches) {
            if (matches.length > 0) {
                $scope.eliteGames = matches;
                $scope.eliteGame = $scope.eliteGames[0];
                $scope.liveEliteGames = true;
            }
            else {
                $scope.liveEliteGames = false;
            }
        });


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
                    $scope.pages = [0, 1];
                }
                if ($scope.selectedGameType.id == 1) {
                    $scope.numSteps = 4;
                    $scope.pages = [0, 21, 22, 23];
                    if ($scope.lowerDivisionVolleyball.homeTeam.players.length == 0 &&
                        $scope.lowerDivisionVolleyball.awayTeam.players.length == 0) {
                        $scope.addPlayer('home', 8);
                        $scope.addPlayer('away', 8);
                    }
                }
                if ($scope.selectedGameType.id == 2) {
                    $scope.numSteps = 3;
                    $scope.pages = [0, 31, 32];

                    if ($scope.lowerDivisionVolleyball.homeTeam.players.length == 0 &&
                        $scope.lowerDivisionVolleyball.awayTeam.players.length == 0) {
                        $scope.addPlayer('home', 2);
                        $scope.addPlayer('away', 2);
                    }
                }
            }

            $scope.active = $scope.pages[n];
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
                $scope.goToStep($scope.active % 10 + 1);
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


            if ($scope.selectedGameType.id == 1) {
                data.homeTeam.name = $scope.selectedHomeTeam.name;
                data.homeTeam.logo = $scope.selectedHomeTeam.logo;

                data.awayTeam.name = $scope.selectedAwayTeam.name;
                data.awayTeam.logo = $scope.selectedAwayTeam.logo

                // Cleanup players:
                var p = [];
                for (var i in data.homeTeam.players) {
                    if (data.homeTeam.players[i].name == "") {
                        continue;
                    }
                    p.push(data.homeTeam.players[i]);
                }
                data.homeTeam.players = p;

                p = [];
                for (var i in data.awayTeam.players) {
                    if (data.awayTeam.players[i].name == "") {
                        continue;
                    }
                    p.push(data.awayTeam.players[i]);
                }

                data.setPoints = $scope.currentIndoorSets.sets;
                data.awayTeam.players = p;

            }

            if ($scope.selectedGameType.id == 2) {
                var htName = "";
                var p1 = data.homeTeam.players[0].name.match(/\s(\S+)$/);
                if (p1) {
                    htName += p1[1];
                }
                else {
                    htName = data.homeTeam.players[0].name;
                }

                var p2 = data.homeTeam.players[1].name.match(/\s(\S+)$/);
                if (p2) {
                    htName += ' / ' + p2[1];
                }
                else if (data.homeTeam.players[1].name) {
                    htName += ' / ' + data.homeTeam.players[1].name;
                }

                var atName = "";
                p1 = data.awayTeam.players[0].name.match(/\s(\S+)$/);
                if (p1) {
                    atName += p1[1];
                }
                else {
                    atName += data.awayTeam.players[0].name;
                }
                p2 = data.awayTeam.players[1].name.match(/\s(\S+)$/);
                if (p2) {
                    atName += ' / ' + p2[1];
                }
                else if (data.awayTeam.players[1].name) {
                    atName += ' / ' + data.awayTeam.players[1].name;
                }

                data.homeTeam.name = htName;
                data.awayTeam.name = atName;

                data.setPoints = $scope.currentBeachSets.sets;
                data.type = 'beach-volleyball';
            }

            if ($scope.selectedGameType.id == 0) {
                data = {poengligaGameUrl: $scope.eliteGame.poengligaGameUrl};
            }

            GameService.createNewGame(data).then(function (gameData) {
                document.location.href = '/game/' + gameData.gameCode + '/control'
            });
        };



        updateProgressWidth();
    }]);
})(angular);