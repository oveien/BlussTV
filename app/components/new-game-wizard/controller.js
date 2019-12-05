(function (angular) {
    var app = angular.module('blussTVFrontPage');

    app.filter('iif', function () {
        return function(input, trueValue, falseValue) {
            return input ? trueValue : falseValue;
        };
    });

    app.controller('newGameWizardController',  ['$scope', 'GameService', 'BlussTVService', 
        function ($scope, GameService, BlussTVService) {
        var $ctrl = this;

        $scope.active = 0;
        $scope.numSteps = 3;

        $scope.nextButtonText = 'Fortsett';

        $scope.pages = [0, 1];

        $scope.loadingEliteGames = true;
        $scope.loadingEliteGame = false;

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
                name: 'Volleyball - Mizunoligaen/Datavolley'
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
                'homeTeam': 'Test Borte',
                'awayTeam': 'Test Hjemme',
                'MatchID': '1111',
                'title': 'Test Hjemme - Test Borte'
            }
        ];

        //BlussTVService.getLivePoengligaMatches().then ( function (matches) {
        BlussTVService.getLiveDataVolleyMatches().then ( function (matches) {
            $scope.loadingEliteGames = false;
            if (matches.length > 0) {
                var testGame = $scope.eliteGames[0];

                const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
                $scope.eliteGames = [];

                const eliteGames = matches
                  .sort((a, b) => {
                      if (a.time > b.time) {
                          return 1;
                      }
                      if (a.time < b.time) {
                          return -1;
                      }
                      return 0;
                  })
                  .map(match => {
                    let gameTime = new Date(match.time);
                    let min = gameTime.getMinutes();
                    if (min < 10) {
                        min = '0' + min;
                    }
                    const time = gameTime.getHours() + ':' + min;

                    const day = gameTime.getDate() < 10 ? "0" + gameTime.getDate() : gameTime.getDate();
                    const title = `${time}: ${match.homeTeam.name} - ${match.awayTeam.name}`;
                    const gameDay = `${days[gameTime.getDay()]}. ${gameTime.getDate()}.${gameTime.getMonth()+1}`;
                    return {...match, time, gameDay, title};
                });

                $scope.eliteGames = eliteGames;

                $scope.eliteGame = $scope.eliteGames[0];

                $scope.eliteGames.push(testGame);
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

        function newPlayerObject(numb) {
            var number = "";
            if (numb) {
                number = numb;
            }

            return {
                name: '',
                id: Math.floor((Math.random() * 1000000000000) + 1),
                number: number,
                position: ''
            };
        }

        $scope.addPlayer = function (team, num) {
            if (!num) {
                num = 1;
            }

            for (var i = 0; i<num; i++) {
                if (team == 'home') {
                    $scope.lowerDivisionVolleyball.homeTeam.players.push(newPlayerObject());
                }
                else {
                    $scope.lowerDivisionVolleyball.awayTeam.players.push(newPlayerObject());
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
                data = {
                    dataVolley: {
                        matchId: $scope.eliteGame.MatchID
                    }
                }
            }

            $scope.loadingEliteGame = true;
            var nbt = $scope.nextButtonText;

            $scope.nextButtonText = 'Laster spillerbilder';
            GameService.createNewGame(data).then(function (gameData) {

                if (!gameData) {
                    alert('Fant ikke kampen. Er den oppretta i DataVolley?')
                    $scope.loadingEliteGame = false;
                    $scope.nextButtonText = nbt;
                    return;
                }

                document.location.href = '/game/' + gameData.gameCode + '/control'
            });
        };



        updateProgressWidth();
    }]);
})(angular);