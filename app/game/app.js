(function (angular) {

    var requires = [
        'services',
        'ui.bootstrap',
        'firebase'
    ];

    var app = angular.module('blussTV', requires);




    app.component('mainContainer', {
        templateUrl: '/components/main/main.html',
        controller: "mainController"
    });

    var config = {
        apiKey: "AIzaSyAroBDj0Vw_4JdwKAWmB5Nq7ydjKq86mFM",
        authDomain: "beachvolleyball-scoreboard.firebaseapp.com",
        databaseURL: "https://beachvolleyball-scoreboard.firebaseio.com",
        projectId: "beachvolleyball-scoreboard",
        storageBucket: "beachvolleyball-scoreboard.appspot.com"
    };


    firebase.initializeApp(config);


})(window.angular);