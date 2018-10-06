(function(angular) {
    var app = angular.module('blussTV');
    app.controller('statisticsController', [
        '$scope',
        'CasparCGService',
        'GameService',
        function($scope, CasparCGService, GameService) {
            $scope.showing = false;

            $scope.manualTeamPoints = false;

            $scope.homeTeam = {};
            $scope.awayTeam = {};

            $scope.currentStat = 'set';
            $scope.currentStatSet = 1;

            $scope.gameCurrentSet = 1;

            var homeTeam = null;
            var awayTeam = null;

            $scope.toggleCompareTeams = function() {
                if (CasparCGService.getCurrentOverlay() == 'team-compare') {
                    CasparCGService.removeOverlay();
                    $scope.showing = false;
                } else {
                    $scope.showing = 'team-compare';

                    var ht = $scope.homeTeam;
                    var at = $scope.awayTeam;

                    var data = {
                        homeTeam: {
                            logo: ht.logo,
                            name: ht.name,
                            blocks: $scope.homeTeam.blocks,
                            attack: $scope.homeTeam.attack,
                            ace: $scope.homeTeam.ace,
                            opponentErrors: $scope.homeTeam.opponentErrors,
                            total: $scope.homeTeam.total,
                        },
                        awayTeam: {
                            logo: at.logo,
                            name: at.name,
                            blocks: $scope.awayTeam.blocks,
                            attack: $scope.awayTeam.attack,
                            ace: $scope.awayTeam.ace,
                            opponentErrors: $scope.awayTeam.opponentErrors,
                            total: $scope.awayTeam.total,
                        },
                        type: $scope.currentStat,
                        set: $scope.currentStatSet,
                    };

                    var stats = GameService.getCurrentScore();
                    console.log(stats);

                    console.log(JSON.stringify(data));
                    console.log(data);
                    CasparCGService.runOverlay('team-compare', data);
                }
            };

            $scope.toggleComparePlayers = function() {
                if (CasparCGService.getCurrentOverlay() == 'player-compare') {
                    CasparCGService.removeOverlay();
                    $scope.showing = false;
                } else {
                    $scope.showing = 'player-compare';

                    var stats = {
                        stats: $scope.getBestPlayers(),
                        homeTeam: {
                            logo: $scope.homeTeam.logo,
                            name: $scope.homeTeam.name,
                        },
                        awayTeam: {
                            logo: $scope.awayTeam.logo,
                            name: $scope.awayTeam.name,
                        },
                        type: $scope.currentStat,
                        set: $scope.currentStatSet,
                    };

                    CasparCGService.runOverlay('player-compare', stats);
                }
            };

            $scope.updateStats = function(what, set) {
                $scope.currentStat = what;
                $scope.currentStatSet = set;

                var stats = GameService.getCurrentScore();

                var homePoints = 0;
                var awayPoints = 0;

                var hs,
                    as = null;
                var htPoints = 0
                var atPoints = 0;

                if (what == 'total') {
                    hs = homeTeam.statistics.total;
                    as = awayTeam.statistics.total;

                    for (var i = 0; i<stats.homeTeam.setPoints.length; i++) {
                        htPoints += stats.homeTeam.setPoints[i];
                    }

                    for (var i = 0; i<stats.awayTeam.setPoints.length; i++) {
                        atPoints += stats.awayTeam.setPoints[i];
                    }

                } else {
                    hs = homeTeam.statistics.sets[set - 1];
                    as = awayTeam.statistics.sets[set - 1];

                    htPoints = stats.homeTeam.setPoints[set - 1];
                    atPoints = stats.awayTeam.setPoints[set - 1];
                }

                $scope.homeTeam.ace = hs.ace;
                $scope.homeTeam.attack = hs.attack;
                $scope.homeTeam.blocks = hs.blocks;
                $scope.homeTeam.opponentErrors = ( htPoints -  ((hs.blocks || 0) +
                                                 (hs.attack || 0) +
                                                 (hs.ace || 0) ));
                $scope.homeTeam.name = homeTeam.name;
                $scope.homeTeam.logo = homeTeam.logo;
                $scope.homeTeam.total = htPoints;


                $scope.awayTeam.ace = as.ace;
                $scope.awayTeam.total = atPoints;
                $scope.awayTeam.attack = as.attack;
                $scope.awayTeam.blocks = as.blocks;
                $scope.awayTeam.opponentErrors = ( atPoints -  ((as.blocks || 0) +
                                                (as.attack || 0) +
                                                (as.ace || 0) ));
                $scope.awayTeam.name = awayTeam.name;
                $scope.awayTeam.logo = awayTeam.logo;

                $scope.homeTeam.players = hs.players;
                $scope.awayTeam.players = as.players;

                bestPlayersChanged = true;
            };

            var bestPlayersChanged = false;
            var bestPlayers = null;

            GameService.registerObserverCallback('score-update', function() {
                console.log('Woho, got score update!');

                if (!$scope.manualTeamPoints) {
                    console.log('yey');

                    var score = GameService.getCurrentScore();
                    var ht = GameService.getTeam('home');
                    var at = GameService.getTeam('away');
                    $scope.homeTeam.name = ht.name;
                    $scope.awayTeam.name = at.name;
                    console.log('yey');

                    console.log(score);
                    homeTeam = score.homeTeam;
                    awayTeam = score.awayTeam;

                    homeTeam.name = ht.name;
                    awayTeam.name = at.name;

                    $scope.gameCurrentSet = score.currentSet;

                    $scope.updateStats(
                        $scope.currentStat,
                        $scope.currentStatSet
                    );
                    console.log('yey 15');

                    //updateScoreboard();
                }
            });

            $scope.getBestPlayers = function() {
                console.log('Get best players');

                if (!$scope.homeTeam.players) {
                    console.log('players not set');
                    return [];
                }

                if (!bestPlayersChanged) {
                    console.log('players not changed');
                    return bestPlayers;
                }

                // We need to clone the array to avoid loop hell:
                var sortedA = $scope.homeTeam.players.sort(function(a, b) {
                    console.log(a.points);
                    return b.points - a.points;
                });

                var sortedB = $scope.awayTeam.players.sort(function(a, b) {
                    return b.points - a.points;
                });

                var rows = [];
                for (var i = 0; i<15; i++) {
                    if ( (!sortedA[i] || sortedA[i].points == 0) && (!sortedB[i] || sortedB[i].points == 0)) {
                        console.log('No point anymore');
                        break;
                    }

                    var row = {};

                    if (sortedA[i] && sortedA[i].points > 0) {
                        row.homeTeam = {
                            number: sortedA[i].number,
                            name: sortedA[i].name,
                            blocks: sortedA[i].blocks,
                            attack: sortedA[i].attack,
                            ace: sortedA[i].ace,
                            total: sortedA[i].points,
                        };
                    } else {
                        row.homeTeam = {
                            name: '',
                            blocks: '',
                            attack: '',
                            ace: '',
                            total: '',
                        };
                    }
                    if (sortedB && sortedB[i].points > 0) {
                        row.awayTeam = {
                            number: sortedB[i].number,
                            name: sortedB[i].name,
                            blocks: sortedB[i].blocks,
                            attack: sortedB[i].attack,
                            ace: sortedB[i].ace,
                            total: sortedB[i].points,
                        };
                    } else {
                        row.awayTeam = {
                            name: '',
                            blocks: '',
                            attack: '',
                            ace: '',
                            total: '',
                        };
                    }

                    rows.push(row);
                }

                console.log(rows);
                bestPlayersChanged = false;

                bestPlayers = rows;
                return rows;
            };

            CasparCGService.registerObserverCallback(
                ['overlay-play', 'overlay-remove'],
                function(type, data) {
                    if (type == 'overlay-remove') {
                        $scope.showing = false;
                        return;
                    }

                    // New overlay:
                    if (
                        data.template != 'team-compare' &&
                        data.template != 'player-compare'
                    ) {
                        $scope.showing = false;
                    } else {
                        $scope.showing = data.template;
                    }
                }
            );

            $scope.getGameType = function() {
                alert('get game type');
                return GameService.getGameType();
            };
        },
    ]);
})(window.angular);
