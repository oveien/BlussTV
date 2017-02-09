(function (angular) {

    var requires = [
        'services',
        'ui.bootstrap'
    ];

    var app = angular.module('blussTV', requires);


    app.component('mainContainer', {
        templateUrl: 'components/main/main.html',
        controller: "mainController"
    });


})(window.angular);