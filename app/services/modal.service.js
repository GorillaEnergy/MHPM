;(function () {
    'use strict';

    angular
        .module('service.modalSvc', [])
        .service('modalSvc', modalSvc);

    modalSvc.$inject = ['$mdDialog', 'url', '$localStorage', '$state', 'toastr'];

    function modalSvc($mdDialog, url, $localStorage, $state, toastr) {

        let model = {
            incomingBusy: incomingBusy,
            incomingCall: incomingCall
        };

        function incomingBusy(data) {
            return $mdDialog.show({
                controller: 'IncomingOnBusyController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/incoming-on-busy/incoming-on-busy.html',
                clickOutsideToClose: false,
            });
        }

        function incomingCall(data) {
            return $mdDialog.show({
                controller: 'IncomingCallController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/incoming-call/incoming-call.html',
                clickOutsideToClose: false,
            });
        }

        return model;


    }
})();