;(function () {
    'use strict';
    angular.module('app')
        .controller('ScheduleController', ScheduleController);

    ScheduleController.$inject = ['$localStorage', '$state'];

    function ScheduleController($localStorage, $state) {
       let vm = this;
       console.log('ScheduleController start');

    }
})();