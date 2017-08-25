
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('newFirebaseGameDialogController', ['$scope',  'GameService', '$firebaseObject', function ($scope, GameService, $firebaseObject) {
        $scope.tournamentId = "";
        $scope.matchId = "";

        // Preload game-id?
        GameService.getGameInfo().then (function (g) {
            console.log(g);
            if (g.firebase) {
                $scope.tournamentId = g.firebase.tournamentId;
            }
            else {
            }
        })

        $scope.close = function () {
            $scope.$ctrl.modalInstance.dismiss();
        }

        $scope.startFirebaseGame = function () {

            var matchRef = firebase.database().ref('/tournament_matches/'+$scope.tournamentId + '/' + $scope.matchId);

            var matchInfo = $firebaseObject(matchRef);
            matchInfo.$loaded().then (function (data) {
                console.log(data);
                if (!data.b1Player) {
                    alert('Game not found');
                    return;
                }
                console.log(data);

                var game = {
                    homeTeam: {
                        players: [
                            {
                                name: data.h1Player,
                                number: '1',
                                id: Math.floor((Math.random() * 1000000000000) + 1),
                            },
                            {
                                name: data.h2Player,
                                number: '2',
                                id: Math.floor((Math.random() * 1000000000000) + 1),
                            },

                        ]
                    },
                    awayTeam: {
                        players: [
                            {
                                name: data.b1Player,
                                number: '1',
                                id: Math.floor((Math.random() * 1000000000000) + 1),
                            },
                            {
                                name: data.b2Player,
                                number: '2',
                                id: Math.floor((Math.random() * 1000000000000) + 1),
                            },

                        ]
                    }
                };


                var htName = "";
                var p1 = game.homeTeam.players[0].name.match(/\s(\S+)$/);
                if (p1) {
                    htName += p1[1];
                }
                else {
                    htName = game.homeTeam.players[0].name;
                }

                var p2 = game.homeTeam.players[1].name.match(/\s(\S+)$/);
                if (p2) {
                    htName += ' / ' + p2[1];
                }
                else if (game.homeTeam.players[1].name) {
                    htName += ' / ' + game.homeTeam.players[1].name;
                }

                var atName = "";
                p1 = game.awayTeam.players[0].name.match(/\s(\S+)$/);
                if (p1) {
                    atName += p1[1];
                }
                else {
                    atName += game.awayTeam.players[0].name;
                }
                p2 = game.awayTeam.players[1].name.match(/\s(\S+)$/);
                if (p2) {
                    atName += ' / ' + p2[1];
                }
                else if (game.awayTeam.players[1].name) {
                    atName += ' / ' + game.awayTeam.players[1].name;
                }

                game.homeTeam.name = htName;
                game.awayTeam.name = atName;

                GameService.getGameInfo().then(function (g) {
                    g.homeTeam = game.homeTeam;
                    g.awayTeam = game.awayTeam;

                    g.firebase = {
                        matchId: $scope.matchId,
                        tournamentId: $scope.tournamentId
                    };

                    GameService.createNewGame(g).then (function () {
                        //$scope.$ctrl.modalInstance.close({matchId: $scope.matchId, tournamentId: $scope.tournamentId});
                        // Reload for the fun of it (and to load stuff):
                        document.location.reload ();
                    });
                })

                console.log(game);
            });
            /*
            var tournamentsRef = firebase.database().ref('tournaments');


            var matchesObj = $firebaseObject(matchesRef);
            var tournamentsObj = $firebaseObject(tournamentsRef);

            // to take an action after the data loads, use the $loaded() promise
            matchesObj.$watch(function () {

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

            $scope.$ctrl.modalInstance.close({matchId: $scope.matchId, tournamentId: $scope.tournamentId});
            */
        }
    }]);
})(window.angular);