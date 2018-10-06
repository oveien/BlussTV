(function(angular) {
    var app = angular.module('blussTV');
    app.controller('miscController', [
        '$scope',
        'CasparCGService',
        'GameService',
        function($scope, CasparCGService, GameService) {
            $scope.interviewee = [];

            var gameInfo = null;
            GameService.getGameInfo().then( function(gi) {
                gameInfo = gi;
                $scope.homeTeam = gi.homeTeam;
                $scope.awayTeam = gi.awayTeam;

                $scope.intervieweePreset = "";

                $scope.interviewee.push({
                    name: '',
                    role: '',
                    logo: null,
                });

                $scope.interviewee.push({
                    name: '',
                    role: '',
                    logo: null,
                });

                $scope.showTwoPersons = false;

                $scope.showing = false;

                $scope.manualScore = false;

                $scope.logoOptions = [
                    {
                        name: 'No logo',
                    },
                    {
                        name: $scope.homeTeam.name,
                        path: $scope.homeTeam.logo,
                    },
                    {
                        name: $scope.awayTeam.name,
                        path: $scope.awayTeam.logo,
                    },
                    {
                        name: 'Referee',
                        path: '/graphics/icons/referee.png',
                    },
                    {
                        name: 'Commentator',
                        path: '/graphics/icons/microphone.png',
                    },
                ];

                $scope.interviewee[0].logo = $scope.logoOptions[0];
                $scope.interviewee[1].logo = $scope.logoOptions[0];
            });



            $scope.onChangePreset = function() {
                switch ($scope.intervieweePreset) {
                    case "referees":
                        $scope.interviewee[0].logo = $scope.logoOptions[3];
                        $scope.interviewee[0].name = gameInfo.referees.mainRef;
                        $scope.interviewee[0].role = '1. dommer';
                        $scope.interviewee[1].logo = $scope.logoOptions[3];
                        $scope.interviewee[1].name = gameInfo.referees.secondRef;
                        $scope.interviewee[1].role = '2. dommer';
                        $scope.showTwoPersons = true;
                        break;
                    case "commentators":
                        $scope.interviewee[0].logo = $scope.logoOptions[4];
                        $scope.interviewee[0].name = gameInfo.commentators.commentator
                        $scope.interviewee[0].role = 'Kommentator';
                        $scope.showTwoPersons = false;

                        if (gameInfo.commentators.expert) {
                            $scope.interviewee[1].logo = $scope.logoOptions[4];
                            $scope.interviewee[1].name = gameInfo.commentators.expert;
                            $scope.interviewee[1].role = 'Ekspertkommentator';
                            $scope.intervieweePreset = "";
                            $scope.showTwoPersons = true;
                        }
                        break;
                    case "homeTeamCoach1":
                        $scope.interviewee[0].logo = $scope.logoOptions[1];
                        $scope.interviewee[0].name = gameInfo.homeTeam.coach1;
                        $scope.interviewee[0].role = `Trener ${gameInfo.homeTeam.name}`;
                        $scope.showTwoPersons = false;
                        break;
                    case "homeTeamCoach2":
                        $scope.interviewee[0].logo = $scope.logoOptions[1];
                        $scope.interviewee[0].name = gameInfo.homeTeam.coach2;
                        $scope.interviewee[0].role = `Hjelpetrener ${gameInfo.homeTeam.name}`;
                        $scope.showTwoPersons = false;
                        break;
                    case "awayTeamCoach1":
                        $scope.interviewee[0].logo = $scope.logoOptions[2];
                        $scope.interviewee[0].name = gameInfo.awayTeam.coach1;
                        $scope.interviewee[0].role = `Trener ${gameInfo.awayTeam.name}`;
                        $scope.showTwoPersons = false;
                        break;
                    case "awayTeamCoach2":
                        $scope.interviewee[0].logo = $scope.logoOptions[2];
                        $scope.interviewee[0].name = gameInfo.awayTeam.coach2;
                        $scope.interviewee[0].role = `Hjelpetrener ${gameInfo.awayTeam.name}`;
                        $scope.showTwoPersons = false;
                        break;
                }
                $scope.intervieweePreset = "";
            }

            $scope.toggleShowing = function(what) {
                if (CasparCGService.getCurrentOverlay() == what) {
                    CasparCGService.removeOverlay();
                    $scope.showing = false;
                } else {
                    $scope.showing = 'interviewee';

                    var data = {
                        name1: $scope.interviewee[0].name,
                        role1: $scope.interviewee[0].role,
                        logo1: $scope.interviewee[0].logo.path,
                    };
                    if ($scope.showTwoPersons) {
                        data.name2 = $scope.interviewee[1].name;
                        data.role2 = $scope.interviewee[1].role;
                        data.logo2 = $scope.interviewee[1].logo.path;
                    }

                    console.log($scope.interviewee);

                    CasparCGService.runOverlay(what, data);
                }
            };

            CasparCGService.registerObserverCallback(
                ['overlay-play', 'overlay-remove'],
                function(type, data) {
                    if (type == 'overlay-remove') {
                        $scope.showing = false;
                        return;
                    }

                    // New overlay:
                    if (data.template != 'interviewee') {
                        $scope.showing = false;
                    }
                }
            );

        },
    ]);
})(window.angular);

