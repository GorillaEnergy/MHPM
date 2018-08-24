;(function () {
    'use strict';
    angular.module('app')
        .controller('IncomingOnBusyController', IncomingOnBusyController);

    IncomingOnBusyController.$inject = ['$mdDialog', 'opponent_name'];

    function IncomingOnBusyController($mdDialog, opponent_name) {
        let vm = this;

        vm.opponent_name = opponent_name;

        vm.newConnect = newConnect;
        vm.addToCurrent = addToCurrent;
        vm.close = close;

        function newConnect() {
            close('new')
        }
        function addToCurrent() {
            close('add')
        }

        function close(data) {
            $mdDialog.hide(data);
        }
    }
})();