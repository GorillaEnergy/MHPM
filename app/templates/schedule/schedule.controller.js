;(function () {
    'use strict';
    angular.module('app')
        .controller('ScheduleController', ScheduleController);

    ScheduleController.$inject = ['$localStorage', '$state', 'scheduleService', '$scope', 'uiCalendarConfig'];

    function ScheduleController($localStorage, $state, scheduleService, $scope, uiCalendarConfig) {
       let vm = this;
       console.log('ScheduleController start');

       vm.busyOnWeek = scheduleService.busyOnWeek();
       console.log(vm.busyOnWeek);

        $scope.eventSources = [];

        $scope.uiConfig = {
            calendar:{
                height: 450,
                editable: true,
                header:{
                    left: 'month basicWeek basicDay agendaWeek agendaDay',
                    center: 'title',
                    right: 'today prev,next'
                },
                eventClick: $scope.alertEventOnClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize
            }
        };
    }
})();