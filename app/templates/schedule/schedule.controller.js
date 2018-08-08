;(function () {
    'use strict';
    angular.module('app')
        .controller('ScheduleController', ScheduleController);

    ScheduleController.$inject = ['$localStorage', '$state', 'scheduleService'];

    function ScheduleController($localStorage, $state, scheduleService) {
       let vm = this;
       console.log('ScheduleController start');

       vm.busyOnWeek = scheduleService.busyOnWeek();
       console.log(vm.busyOnWeek);
    }
})();