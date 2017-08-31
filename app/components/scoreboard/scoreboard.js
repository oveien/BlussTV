
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('scoreBoardController', ['$scope', 'CasparCGService', 'GameService', '$document','$firebaseObject',
        function ($scope, CasparCGService, GameService, $document, $firebaseObject) {
        $scope.showing = false;

        $scope.manualScore = GameService.getManualScore ();

        $scope.gameSetPoints = GameService.getSetPoints()


        $scope.toggleShowing = function () {
            if (CasparCGService.getCurrentOverlay() == 'scoreboard') {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = true;
                CasparCGService.runOverlay('scoreboard', getScoreData());
            }
        }

        $scope.homeTeamName = GameService.getTeamName('home');
        $scope.awayTeamName = GameService.getTeamName('away');


        var onGameInfo = function () {
            GameService.getGameInfo().then( function (game) {

                $scope.homeTeamName = game.homeTeam.name;
                $scope.awayTeamName = game.awayTeam.name;

                $scope.manualScore = game.manualScore;
                $scope.gameSetPoints = game.setPoints;

                if (game.firebase) {
                    // Auto-score:
                    runFirebaseScore(game);
                }
            });
        };

        var fireBaseTournamentId = "";
        var fireBaseMatchId = "";
        var runFirebaseScore = function (game) {
            if (game.firebase.tournamentId != fireBaseTournamentId && game.firebase.matchId != fireBaseMatchId) {
                // Start new watcher:
                fireBaseTournamentId = game.firebase.tournamentId;
                fireBaseMatchId = game.firebase.matchId;
                var url = '/tournament_matches/'+fireBaseTournamentId + '/' + fireBaseMatchId;
                console.log(url);
                var matchRef = firebase.database().ref(url);
                var matchInfo = $firebaseObject(matchRef);
                matchInfo.$watch( function () {
                    var m = matchInfo;
                    console.log(matchInfo);

                    var sets = m.scoreInCompletedSet.split(",");
                    console.log(sets);
                    var s = 0;
                    for (var i = 0; i<sets.length; i++) {
                      console.log(sets[i]);
                        var re = sets[i].match(/(\d+)[\s\-]+(\d+)/);
                        console.log(re);
                        if (re) {
                            $scope.pointsHomeTeam[s] = re[1];
                            $scope.pointsAwayTeam[s] = re[2];
                            s++;
                        }
                    }

                    $scope.pointsHomeTeam[s] = m.pointsInCurrentSet[0];
                    $scope.pointsAwayTeam[s] = m.pointsInCurrentSet[1];

                    var score = {
                        homeTeam: {
                            setPoints: $scope.pointsHomeTeam
                        },
                        awayTeam: {
                            setPoints: $scope.pointsAwayTeam
                        },

                    }

                    GameService.setCurrentScore(score);
                    
                    $scope.updateScoreboard();
                });
            }
        }



        GameService.getGameInfo().then (onGameInfo);

        GameService.registerObserverCallback('game-info', onGameInfo);


        GameService.registerObserverCallback('score-update', function () {
            console.log('Woho, got score update!');

            if (!$scope.manualScore) {
                var score = GameService.getCurrentScore();

                $scope.pointsHomeTeam = score.homeTeam.setPoints;
                $scope.pointsAwayTeam = score.awayTeam.setPoints;

                $scope.updateScoreboard();
            }
        });

        $scope.pointsHomeTeam = [];
        for (var i in $scope.gameSetPoints) {
            $scope.pointsHomeTeam.push(0);
        }
        $scope.pointsAwayTeam = [];
        for (var i in $scope.gameSetPoints) {
            $scope.pointsAwayTeam.push(0);
        }

        /*
        $document.keydown ( function (e) {
            console.log(e.keyCode);
            if (e.keyCode == 72 || e.keyCode == 65) {
                var team = '';
                if (e.keyCode == 72) {
                    team = 'home';
                }
                else {
                    team = 'away';
                }
                
                if (e.ctrlKey) {
                    $scope.removePoint(team);
                }
                else {
                    $scope.addPoint(team);
                }
                $scope.$digest ();
                console.log(e);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        */

        $scope.addPoint = function (team) {
            for (var i in $scope.pointsHomeTeam) {
                if ( $scope.pointsHomeTeam[i] <  $scope.gameSetPoints[i] && $scope.pointsAwayTeam[i] <  $scope.gameSetPoints[i]) {
                    break;
                }
                else if (Math.abs($scope.pointsHomeTeam[i] - $scope.pointsAwayTeam[i] ) < 2) {
                    break;
                }
            }

            if (team == 'home') {
                $scope.pointsHomeTeam[i]++;
            }
            else {
                $scope.pointsAwayTeam[i]++;
            }

            var score = {
                homeTeam: {
                    setPoints: $scope.pointsHomeTeam
                },
                awayTeam: {
                    setPoints: $scope.pointsAwayTeam
                },

            }

            GameService.setCurrentScore(score);

            $scope.updateScoreboard();
        };

        $scope.removePoint = function (team) {


            for (var i = $scope.pointsHomeTeam.length; i > 0; i--) {
                if ( $scope.pointsHomeTeam[i] > 0 || $scope.pointsAwayTeam[i] > 0) {
                    break;
                }
            }

            if (team == 'home') {
                if ($scope.pointsHomeTeam[i] > 0) {
                    $scope.pointsHomeTeam[i]--;
                }
            }
            else {
                if ($scope.pointsAwayTeam[i]) {
                    $scope.pointsAwayTeam[i]--;
                }
            }

            $scope.updateScoreboard();
        };

        var getScoreData = function () {


            var ht = GameService.getTeam('home');
            var at = GameService.getTeam('away');

            var data = {
                homeTeam: {
                    name: ht.name,
                    sets: 0,
                    points: 0,
                    pointsSets: $scope.pointsHomeTeam,
                    logo: ht.logo,
                    jersey: ht.jersey
                },
                awayTeam: {
                    name: at.name,
                    sets: 0,
                    points: 0,
                    pointsSets: $scope.pointsAwayTeam,
                    logo: at.logo,
                    jersey: at.jersey
                },
            };



            for (var i in $scope.pointsHomeTeam) {

                if (  Math.abs($scope.pointsHomeTeam[i] - $scope.pointsAwayTeam[i] ) >= 2 &&
                    ( ($scope.pointsHomeTeam[i] >= $scope.gameSetPoints[i] || $scope.pointsAwayTeam[i] >= $scope.gameSetPoints[i]) ) ) {

                    if ($scope.pointsHomeTeam[i] > $scope.pointsAwayTeam[i]) {
                        data.homeTeam.sets++;
                    }
                    else {
                        data.awayTeam.sets++;
                    }


                }
                else if ($scope.pointsHomeTeam[i] > 0 || $scope.pointsAwayTeam[i] > 0) {
                    data.homeTeam.points = $scope.pointsHomeTeam[i];
                    data.awayTeam.points = $scope.pointsAwayTeam[i];
                }
            }
            return data;
        };

        $scope.updateScoreboard = function () {
            // Are we showing?
            if (CasparCGService.getCurrentOverlay() != 'scoreboard') {
                return;
            }

            var data = getScoreData();

            console.log(data);
            CasparCGService.updateOverlay('scoreboard', data);
        };

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {

            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'scoreboard') {
                $scope.showing = false;
            }

        });


    }]);
})(window.angular);