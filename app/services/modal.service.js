;(function () {
    'use strict';

    angular
        .module('service.modalSvc', [])
        .service('modalSvc', modalSvc);

    modalSvc.$inject = ['$mdDialog', 'url', '$localStorage', '$state', 'toastr'];

    function modalSvc($mdDialog, url, $localStorage, $state, toastr) {

        let model = {
            incomingBusy: incomingBusy,
            incomingCall: incomingCall,
            warningStateGo: warningStateGo,
            sendEmergency: sendEmergency,
            liveRoom: liveRoom,
            sendLog: sendLog,
            cancel: cancel
        };

        function cancel() {
            $mdDialog.cancel();
        }

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

        function warningStateGo() {
            return $mdDialog.show({
                controller: 'StateGoWarning',
                controllerAs: 'vm',
                templateUrl: 'components/state-go-warning/state-go-warning.html',
                clickOutsideToClose: true
            });
        }

        function liveRoom(data) {
            return $mdDialog.show({
                controller: 'LiveRoomController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/live-room/live-room.html',
                clickOutsideToClose: true,
            });
        }

        function sendLog(data) {
            return $mdDialog.show({
                controller: 'SendLogController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/send-log/send-log.html',
                clickOutsideToClose: true,
            });
        }

        function sendEmergency(data) {
            return $mdDialog.show({
                controller: 'SendEmergencyLogController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/send-emergency-log/send-emergency-log.html',
                clickOutsideToClose: true,
            });
        }

        return model;


    }
})();