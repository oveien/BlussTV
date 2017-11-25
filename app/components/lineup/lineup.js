
(function (angular) {
    var app = angular.module('blussTV');
    app.controller('lineupController', ['$scope', 'GameService', 'CasparCGService', function ($scope, GameService, CasparCGService) {

        $scope.homeTeamLineup = [
            {number: '', pos: 'I'},
            {number: '', pos: 'II'},
            {number: '', pos: 'III'},
            {number: '', pos: 'IV'},
            {number: '', pos: 'V'},
            {number: '', pos: 'VI'},
            {number: '', pos: 'L'}
        ];

        $scope.awayTeamLineup = [
            {number: '', pos: 'I'},
            {number: '', pos: 'II'},
            {number: '', pos: 'III'},
            {number: '', pos: 'IV'},
            {number: '', pos: 'V'},
            {number: '', pos: 'VI'},
            {number: '', pos: 'L'}
        ];

        $scope.showing = false;

        $scope.toggleShowing = function () {
            $scope.showing = !$scope.showing;
        }

        $scope.homeTeamName = GameService.getTeamName('home');
        $scope.awayTeamName = GameService.getTeamName('away');

        GameService.registerObserverCallback('game-info', function () {
            $scope.homeTeamName = GameService.getTeamName('home');
            $scope.awayTeamName = GameService.getTeamName('away');
        });

        $scope.getPlayerByNumber = function (team, number) {
            return GameService.getPlayerByNumber(team, number);
        }

        $scope.awayShowing = false;
        $scope.homeShowing = false;

        var currentTeamShowing = '';
        var updateShowing = function() {
            $scope.awayShowing = false;
            $scope.homeShowing = false;

            if (CasparCGService.getCurrentOverlay() == 'lineup') {

                if (currentTeamShowing == "home") {
                    $scope.homeShowing = true;
                }
                if (currentTeamShowing == "away") {
                    $scope.awayShowing = true;
                }
            }
        }

        $scope.toggleTeamShowing = function (team) {

            var data = GameService.getTeam(team);

            if (CasparCGService.getCurrentOverlay() == 'lineup' && currentTeamShowing == team) {
                // The same team, remove it:
                CasparCGService.removeOverlay();
                currentTeamShowing = '';
            }
            else {
                currentTeamShowing = team;

                var d = {};
                d.name = data.name;
                d.logo = data.logo;
                d.jersey = data.jersey;
                d.players = [];

                var numbers = $scope.homeTeamLineup;
                if (team == 'away') {
                    numbers = $scope.awayTeamLineup;
                }

                console.log(team);
                console.log(numbers);

                for (var i in numbers) {
                    var player = GameService.getPlayerByNumber(team, numbers[i].number);
                    if (!player) {
                        player = {
                            name: '',
                            number: ''
                        }
                    }
                    d.players.push({name: player.name, number: player.number});
                }

                console.log(d);
                CasparCGService.runOverlay('lineup', d);
            }

            updateShowing();
        };

        CasparCGService.registerObserverCallback(['overlay-play', 'overlay-remove'], function (type, data) {
            $scope.awayShowing = false;
            $scope.homeShowing = false;
            if (type == 'overlay-remove') {

                return;
            }


            // New overlay:
            if (data.template == 'lineup') {
                if (currentTeamShowing == "home") {
                    $scope.homeShowing = true;
                }
                if (currentTeamShowing == "away") {
                    $scope.awayShowing = true;
                }
            }
        });

        GameService.registerObserverCallback(['lineup-update'], function (type, data) {
            var lineUps = GameService.getCurrentLineup();
            console.log(lineUps);

            for (var i = 0; i<lineUps.homeTeam.length; i++) {
                $scope.homeTeamLineup[i].number = lineUps.homeTeam[i];
            }

            for (var i = 0; i<lineUps.awayTeam.length; i++) {
                $scope.awayTeamLineup[i].number = lineUps.awayTeam[i];
            }

        });

        $scope.getGameType = function () {
            return GameService.getGameType();
        }

    }]);
})(window.angular);