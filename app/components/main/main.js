
(function (angular) {
    var app = angular.module('blussTV');


    app.controller('mainController', ['$scope', '$http', function($scope, $http){

    }]);


    app.component('gameContainer', {
        templateUrl: 'components/gamecontainer/gamecontainer.html',
        controller: "gameController",
    });


    app.component('scoreBoard', {
        templateUrl: 'components/scoreboard/scoreboard.html',
        controller: "scoreBoardController",
    });


    app.component('teamContainer', {
        templateUrl: 'components/teamcontainer/teamcontainer.html',
        controller: "teamContainerController",
    });


    app.component('lineup', {
        templateUrl: 'components/lineup/lineup.html',
        controller: "lineupController",
    });

    /*
    app.component('templateadmintextsearch', {
        templateUrl: 'components/textsearch/textsearch.html',
        controller: "templateAdminTextSearchController",
    });

    app.component('templateadmintemplateinfo', {
        templateUrl: 'components/templateinfo/templateinfo.html',
        controller: "templateAdminTemplateInfoController",
    });
*/

})(window.angular);