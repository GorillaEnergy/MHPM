;(function () {
    'use strict';
    angular
        .module('app')
        .controller('IncomingCallController', IncomingCallController);

    IncomingCallController.$inject = ['$mdDialog', 'data'];

    function IncomingCallController($mdDialog, data) {
        let vm = this;

        console.log(data);
        vm.name = data.opponent_name;

        vm.accept = accept;
        vm.reject = reject;

        function accept() {
            close({accept: true})
        }
        function reject() {
            close({accept: false})
        }

        function close(data) {
            $mdDialog.hide(data)
        }
    }
})();