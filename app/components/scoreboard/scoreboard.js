
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('scoreBoardController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.showing = false;

        $scope.manualScore = false;

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

        GameService.registerObserverCallback('game-info', function () {
            $scope.homeTeamName = GameService.getTeamName('home');
            $scope.awayTeamName = GameService.getTeamName('away');
        });

        GameService.registerObserverCallback('score-update', function () {
            console.log('Woho, got score update!');

            if (!$scope.manualScore) {
                var score = GameService.getCurrentScore();

                $scope.pointsHomeTeam = score.homeTeam.setPoints;
                $scope.pointsAwayTeam = score.awayTeam.setPoints;

                $scope.updateScoreboard();
            }


        });

        $scope.pointsHomeTeam = [0, 0, 0, 0, 0];
        $scope.pointsAwayTeam = [0, 0, 0, 0, 0];


        $scope.addPoint = function (team) {
            for (var i in $scope.pointsHomeTeam) {
                if ( $scope.pointsHomeTeam[i] < 25 && $scope.pointsAwayTeam[i] < 25) {
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
            var data = {
                homeTeam: {
                    name: GameService.getTeamName('home'),
                    sets: 0,
                    points: 0
                },
                awayTeam: {
                    name: GameService.getTeamName('away'),
                    sets: 0,
                    points: 0
                }
            };

            for (var i in $scope.pointsHomeTeam) {

                if (  Math.abs($scope.pointsHomeTeam[i] - $scope.pointsAwayTeam[i] ) >= 2 &&
                    ( ($scope.pointsHomeTeam[i] >= 25 || $scope.pointsAwayTeam[i] >= 25) ||
                        (i == 4 && ($scope.pointsHomeTeam[i] >= 15 || $scope.pointsAwayTeam[i] >= 15) ))  ) {

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