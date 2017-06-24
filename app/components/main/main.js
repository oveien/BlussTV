
(function (angular) {
    var app = angular.module('blussTV');


    app.controller('mainController', ['$scope', 'CasparCGService', 'GameService', '$http', function($scope, CasparCGService, GameService, $http){

        $scope.inputs = [];

        $scope.onNewGame = function () {
            var prompt = window.prompt("Finn url på poengliga.no.", 'http://www.poengliga.no/eliteh/1617/kamper/9web.html');

            if (prompt) {
                // Loading stuff:
                GameService.newGame(prompt);
            }
        }

        $scope.htmlOverLayURL = CasparCGService.getHtmlOverlayUrl ();
    }]);


    app.component('gameContainer', {
        templateUrl: '/components/gamecontainer/gamecontainer.html',
        controller: "gameController"
    });


    app.component('scoreBoard', {
        templateUrl: '/components/scoreboard/scoreboard.html',
        controller: "scoreBoardController"
    });


    app.component('teamContainer', {
        templateUrl: '/components/teamcontainer/teamcontainer.html',
        controller: "teamContainerController"
    });


    app.component('lineup', {
        templateUrl: '/components/lineup/lineup.html',
        controller: "lineupController"
    });

    app.component('teamsPlaying', {
        templateUrl: '/components/teamsplaying/teamsplaying.html',
        controller: "teamsPlayingController"
    });

    app.component('teamSquads', {
        templateUrl: '/components/teamsquads/teamsquads.html',
        controller: "teamSquadsController"
    });

    app.component('beachTeam', {
        templateUrl: '/components/beach-team/beach-team.html',
        controller: "beachTeamController"
    });

    app.component('preGameContainer', {
        templateUrl: '/components/pregamecontainer/pregamecontainer.html',
        controller: 'preGameContainerController'
    });

    app.component('statistics', {
        templateUrl: '/components/statistics/statistics.html',
        controller: 'statisticsController'
    });

    app.component('miscContainer', {
        templateUrl: '/components/misccontainer/misccontainer.html',
        controller: 'miscController'
    });

    app.component('playerInfo', {
        templateUrl: '/components/playerinfo/playerinfo.html',
        controller: 'playerInfoController'
    });

    app.component('playerSubstitution', {
        templateUrl: '/components/playersubstitution/playersubstitution.html',
        controller: 'playerSubstitutionController'
    });

})(window.angular);