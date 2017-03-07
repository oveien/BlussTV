(function (angular) {

    var requires = [
        'services',
        'ui.bootstrap'
    ];

    var app = angular.module('blussTVFrontPage', requires);


    app.component('newGameWizard', {
        templateUrl: 'components/new-game-wizard/template.html',
        controller: "newGameWizardController",
        bindings: {
            modalInstance: "<",
            resolve: "<"
        }
    });


    app.controller('newGameJumbotronController', ['$scope', '$uibModal', function ($scope, $uibModal) {
        var $ctrl = this;
        $ctrl.animationsEnabled = false;
        $ctrl.items = [];

        $scope.modalInstance = null;

        $scope.openNewGameWizard = function () {
            $scope.modalInstance = $uibModal.open({
                animation: $ctrl.animationsEnabled,
                component: 'newGameWizard',
                resolve: {
                    items: function () {
                        return $ctrl.items;
                    }
                }
            });

            $scope.modalInstance.result.then(function (selectedItem) {
                $ctrl.selected = selectedItem;
            }, function () {
                $log.info('modal-component dismissed at: ' + new Date());
            });
        };
    }]);

    app.component('newGameJumbotron', {
        template: '<div class="jumbotron"> \
                <h2>Ny kamp:</h2> \
                <p> \
                    <a href="#myModal" ng-click="openNewGameWizard()" role="button" class="btn btn-default btn-lg" data-toggle="modal">Start</a> \
                </p> \
            </div>',
        controller: 'newGameJumbotronController'
    })



})(window.angular);