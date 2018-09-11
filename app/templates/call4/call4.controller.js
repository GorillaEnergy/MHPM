;(function () {
    'use strict';
    angular.module('app')
        .controller('Call4Controller', Call4Controller);

    Call4Controller.$inject = ['$localStorage', '$state', '$timeout', 'consultants', 'kids', 'userService', '$mdDialog'];

    function Call4Controller($localStorage, $state, $timeout, consultants, kids, userService, $mdDialog) {
        console.log('Call4Controller start');
        let vm = this;


    }
})();