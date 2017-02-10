(function (angular) {
    var app = angular.module('blussTV');
    app.controller('statisticsController', ['$scope', 'CasparCGService', 'GameService', function ($scope, CasparCGService, GameService) {
        $scope.showing = false;

        $scope.manualTeamPoints = false;

        $scope.homeTeam = {};
        $scope.awayTeam = {};

        $scope.toggleCompareTeams = function () {
            if (CasparCGService.getCurrentOverlay() == 'team-compare') {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = 'compare-teams';

                var ht = GameService.getTeam('home');
                var at = GameService.getTeam('away');


                var data = {
                    homeTeam: {
                        logo: ht.logo,
                        name: ht.name,
                        blocks: 0,
                        attack: 0,
                        serve: 0
                    },
                    awayTeam: {
                        logo: at.logo,
                        name: at.name,
                        blocks: 0,
                        attack: 0,
                        serve: 0
                    }
                }

                var stats = GameService.getCurrentScore();
                console.log(stats);

                console.log(JSON.stringify(data));
                CasparCGService.runOverlay('team-compare', data);
            }
        }

        GameService.registerObserverCallback('score-update', function () {
            console.log('Woho, got score update!');

            if (!$scope.manualTeamPoints) {
                var score = GameService.getCurrentScore();

                if (!$scope.manualTeamPoints) {
                    $scope.homeTeam.ace = score.homeTeam.ace;
                    $scope.homeTeam.attack = score.homeTeam.attack;
                    $scope.homeTeam.blocks = score.homeTeam.blocks;
                    $scope.awayTeam.ace = score.awayTeam.ace;
                    $scope.awayTeam.attack = score.awayTeam.attack;
                    $scope.awayTeam.blocks = score.awayTeam.blocks;
                }

                if (!$scope.manualPlayerPoints) {
                    $scope.homeTeam.players = score.homeTeam.players;
                    $scope.awayTeam.players = score.awayTeam.players;
                    bestPlayersChanged = true;
                }

                //updateScoreboard();
            }
        });

        var bestPlayersChanged = false;

        var bestPlayers = null;
        $scope.getBestPlayers = function () {
            if (!$scope.homeTeam.players) {
                return [];
            }

            if (!bestPlayersChanged) {
                return bestPlayers
            }


            // We need to clone the array to avoid loop hell:
            var sortedA = $scope.homeTeam.players.sort ( function (a, b) {
                console.log(a.points);
                return (b.points) - (a.points)
            });

            var sortedB = $scope.awayTeam.players.sort ( function (a, b) {

                return (b.points) - (a.points)
            });

            var rows = [];
            for (var i in sortedA) {

                if (sortedA[i].points == 0 && sortedB[i].points == 0) {
                    console.log('No point anymore');
                    break;
                }

                var row = {};

                if (sortedA[i].points > 0) {
                    row.homeTeam = {
                        name: sortedA[i].name,
                        blocks: sortedA[i].blocks,
                        attack: sortedA[i].attack,
                        ace: sortedA[i].ace,
                        points: sortedA[i].points
                    }
                }
                if (sortedB[i].points > 0) {
                    row.awayTeam = {
                        name: sortedB[i].name,
                        blocks: sortedB[i].blocks,
                        attack: sortedB[i].attack,
                        ace: sortedB[i].ace,
                        points: sortedB[i].points
                    }
                }

                rows.push(row);
            }

            console.log(rows);
            bestPlayersChanged = false;

            bestPlayers = rows;
            return rows;
        };

    }]);
})(window.angular);