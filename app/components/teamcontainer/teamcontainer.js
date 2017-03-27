
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('teamContainerController', ['$scope',  'GameService', 'CasparCGService', '$document', function ($scope, GameService, CasparCGService, $document) {
        var game = null;

        $scope.jerseyColors = ['blue', 'red', 'black', 'grey', 'orange', 'white', 'green', 'yellow', 'pink'];
        $scope.homeTeamChooseJersey = false;
        var currentJerseyType = "";
        var onJerseyOpen = false;

        GameService.getGameInfo().then( function (data) {
            game = data;
            $scope.homeTeam = game.homeTeam;
            $scope.awayTeam = game.awayTeam;
            console.log(game);
        });

        $scope.hasPlayerId = function () {
            if ($scope.homeTeam) {
                for (var i in $scope.homeTeam.players) {
                    if ($scope.homeTeam.players[i].sid) {
                        return true;
                    }
                }
            }
            return false;
        }

        // Hide when out of scope:
        var onClickOutSideJersey = function () {

            if (onJerseyOpen) {
                onJerseyOpen = false;
                return;
            }

            $scope.homeTeamChooseJersey = $scope.awayTeamChooseJersey  = false;

            $document.off("click", onClickOutSideJersey);
            $scope.$apply();
        };

        $scope.changeTeamJersey = function (team, type) {
            $scope.homeTeamChooseJersey = $scope.awayTeamChooseJersey = false;
            currentJerseyType = type;
            if (team == 'home') {
                $scope.homeTeamChooseJersey = true;
            }
            else {
                $scope.awayTeamChooseJersey = true;
            }
            onJerseyOpen = true;
            $document.on("click", onClickOutSideJersey);
        }

        $scope.chooseJersey = function (color) {
            var team = $scope.homeTeam;
            if ($scope.awayTeamChooseJersey) {
                team = $scope.awayTeam;
            }

            if (currentJerseyType == 'player') {
                team.jersey.player = color;
            }
            else {
                team.jersey.libero = color;
            }

            GameService.getGameInfo(function () {
                g.homeTeam = $scope.homeTeam;
                g.awayTeam = $scope.awayTeam;

                GameService.saveChanges(g)

                $scope.homeTeamChooseJersey = $scope.awayTeamChooseJersey = false;
            });
        }

        $scope.setTeamName = function (team) {
            var td = GameService.getTeam(team);

            if (team == 'home') {
                td.name = $scope.homeTeam.name;
            }
            else {
                td.name = $scope.awayTeam.name;
            }

            GameService.setTeamData(team, td);
        }

        $scope.getTeamName = function (ha) {
            if (game) {
                if (ha == 'home') {
                    return game.homeTeam.name;
                }
                else {
                    return game.awayTeam.name;
                }
            }
        }

        $scope.getTeamLogo = function (ha) {
            if (game) {
                if (ha == 'home') {
                    return game.homeTeam.logo;
                }
                else {
                    return game.awayTeam.logo;
                }
            }
        };

        $scope.getTeamPlayers = function (ha) {
            if (game) {
                if (ha == 'home') {
                    return game.homeTeam.players;
                }
                else {
                    return game.awayTeam.players;
                }
            }
        }

        $scope.onChange = function () {
            GameService.saveChanges (game);
        }

        $scope.awayShowing = false;
        $scope.homeShowing = false;

        var currentTeamShowing = '';
        var updateShowing = function() {
            $scope.awayShowing = false;
            $scope.homeShowing = false;

            if (CasparCGService.getCurrentOverlay() == 'squad') {
                if (currentTeamShowing == "home") {
                    $scope.homeShowing = true;
                }
                if (currentTeamShowing == "away") {
                    $scope.awayShowing = true;
                }
            }
        }

        $scope.addPlayer = function (team) {

            var player = {
                name: '',
                id: Math.floor((Math.random() * 1000000000000) + 1)
            }

            if (team == "home") {
                game.homeTeam.players.push(player);
            }
            else {
                game.awayTeam.players.push(player);
            }

            $scope.onChange();

        }

        $scope.uploadImage = function (playerId) {
            console.log('playerId', playerId);

            function handleImageUpload(error, result) {
                if(error) {
                    return console.log('error', error) 
                }
                console.log(result[0].url)
                GameService.addPlayerPicture(playerId, result[0].url);
            }

            window.cloudinary.openUploadWidget({
                cloud_name: 'volleystream',
                api_key: '563498731497358',
                upload_preset: 'o4omshjq' 
            }, handleImageUpload)
        }        

        $scope.toggleTeamShowing = function (team) {
            var data = null;
            if (team == 'home') {
                data = game.homeTeam;
            }
            else {
                data = game.awayTeam;
            }

            if (CasparCGService.getCurrentOverlay() == 'squad' && currentTeamShowing == team) {
                // The same team, remove it:
                CasparCGService.removeOverlay();
                currentTeamShowing = '';
            }
            else {
                currentTeamShowing = team;

                var d = {};
                d.name = data.name;
                d.players = [];

                for (var i in data.players) {
                    if (!data.players[i].deleted) {
                        d.players.push(data.players[i]);
                    }
                }

                CasparCGService.runOverlay('squad', d);
            }

            updateShowing();
        };

    }]);
})(window.angular);