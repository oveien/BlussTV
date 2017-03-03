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
                $scope.showing = 'team-compare';

                var ht = $scope.homeTeam;
                var at = $scope.awayTeam;


                console.log(ht);
                var data = {
                    homeTeam: {
                        logo: ht.logo,
                        name: ht.name,
                        blocks: ht.blocks || 0,
                        attack: ht.attack || 0,
                        ace: ht.ace || 0,
                        total: (ht.blocks || 0 ) + (ht.attack || 0) + (ht.ace || 0)
                    },
                    awayTeam: {
                        logo: at.logo,
                        name: at.name,
                        blocks: at.blocks || 0,
                        attack: at.attack || 0,
                        ace: at.ace || 0,
                        total: (at.blocks || 0 ) + (at.attack || 0) + (at.ace || 0)
                    }
                }

                var stats = GameService.getCurrentScore();
                console.log(stats);

                console.log(JSON.stringify(data));
                console.log(data);
                CasparCGService.runOverlay('team-compare', data);
            }
        }

        $scope.toggleComparePlayers = function () {
            if (CasparCGService.getCurrentOverlay() == 'player-compare') {
                CasparCGService.removeOverlay();
                $scope.showing = false;
            }
            else {
                $scope.showing = 'player-compare';

                var stats = {
                    stats: $scope.getBestPlayers(),
                    homeTeam: {
                        logo: $scope.homeTeam.logo,
                        name: $scope.homeTeam.name
                    },
                    awayTeam: {
                        logo: $scope.awayTeam.logo,
                        name: $scope.awayTeam.name
                    }
                }

                CasparCGService.runOverlay('player-compare', stats);
            }
        }


        GameService.registerObserverCallback('score-update', function (score) {
            console.log('Woho, got score update!');

            if (!$scope.manualTeamPoints) {
                var score = GameService.getCurrentScore();

                var ht = GameService.getTeam('home');
                var at = GameService.getTeam('away');
                $scope.homeTeam.name = ht.name;
                $scope.awayTeam.name = at.name;

                if (!$scope.manualTeamPoints) {
                    $scope.homeTeam.ace = score.homeTeam.ace;
                    $scope.homeTeam.attack = score.homeTeam.attack;
                    $scope.homeTeam.blocks = score.homeTeam.blocks;
                    $scope.homeTeam.name = score.homeTeam.name;
                    $scope.homeTeam.logo = score.homeTeam.logo;
                    $scope.awayTeam.ace = score.awayTeam.ace;
                    $scope.awayTeam.attack = score.awayTeam.attack;
                    $scope.awayTeam.blocks = score.awayTeam.blocks;
                    $scope.awayTeam.name = score.awayTeam.name;
                    $scope.awayTeam.logo = score.awayTeam.logo;
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
                        total: sortedA[i].points
                    }
                }
                else {
                    row.homeTeam = {
                        name: '',
                        blocks: '',
                        attack: '',
                        ace: '',
                        total: ''
                    }
                }
                if (sortedB[i].points > 0) {
                    row.awayTeam = {
                        name: sortedB[i].name,
                        blocks: sortedB[i].blocks,
                        attack: sortedB[i].attack,
                        ace: sortedB[i].ace,
                        total: sortedB[i].points
                    }
                }
                else {
                    row.awayTeam = {
                        name: '',
                        blocks: '',
                        attack: '',
                        ace: '',
                        total: ''
                    }
                }

                rows.push(row);
            }

            console.log(rows);
            bestPlayersChanged = false;

            bestPlayers = rows;
            return rows;
        };


        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {

            if (type == 'overlay-remove') {
                $scope.showing = false;
                return;
            }

            // New overlay:
            if (data.template != 'team-compare' && data.template != 'player-compare') {
                $scope.showing = false;
            }
            else {
                $scope.showing = data.template;
            }

        });

    }]);
})(window.angular);