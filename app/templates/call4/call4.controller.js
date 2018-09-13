;(function () {
    'use strict';
    angular.module('app')
        .controller('Call4Controller', Call4Controller);

    Call4Controller.$inject = ['$localStorage', '$state', '$timeout', 'consultants', 'kids', 'userService', '$mdDialog'];

    function Call4Controller($localStorage, $state, $timeout, consultants, kids, userService, $mdDialog) {
        console.log('Call4Controller start');
        let vm = this;

        vm.volumeChanger = volumeChanger;

        function volumeChanger() {
            console.log(vm.volume / 100);
        }

        let start;
        let end;
        let total_second;
        let total_minutes;
        let total_hours;
        let total;
        start = new Date() * 1;

        $timeout(function () {
            end = new Date() * 1;

            total_second = 300;
            // total_second = Math.floor((end - start) / 1000);
            total_minutes = Math.floor(total_second / 60);
            total_hours = Math.floor(total_minutes / 60);
            total_minutes =  total_minutes - total_hours * 60;

            if (total_minutes < 10) { total_minutes = '0' + total_minutes}
            if (total_hours < 10) { total_hours = '0' + total_hours}
            total = total_hours + ':' + total_minutes;

        }, 1000)

    }
})();