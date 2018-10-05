;(function () {
    'use strict';
    angular
        .module('app')
        .controller('StateGoWarning', StateGoWarning);

    StateGoWarning.$inject = ['$mdDialog'];

    function StateGoWarning($mdDialog) {
        let vm = this;
        vm.close = close;

        function close() {
            $mdDialog.hide()
        }
    }
})();