;(function () {
    'use strict';
    angular.module('app')
        .controller('StatisticController', StatisticController);

    StatisticController.$inject = ['$localStorage', '$state', '$mdDialog', 'statisticService'];

    function StatisticController($localStorage, $state, $mdDialog, statisticService) {
        let vm = this;
        console.log('StatisticController start');

        vm.toLive = toLive;
        vm.editLiveRoom = editLiveRoom;
        vm.createLiveRoom = createLiveRoom;

        vm.schedule = statisticService.schedule();
        vm.data = $localStorage.data;
        console.log(vm.schedule);

        function editLiveRoom(el) {
            console.log(el);
            let data = {
                type: 'update',
                el: el
            };
            showLiveRoomDialog(data)
        }
        function toLive() {
            console.log('toLive');
        }

        function createLiveRoom() {
            let data = { type: 'create' };
            showLiveRoomDialog(data, el)
        }

        function showLiveRoomDialog(data) {
            $mdDialog.show({
                controller: 'LiveRoomController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/live-room/live-room.html',
                clickOutsideToClose: true,
            }).then(function (res) {
                    console.log('close dialog');
                    console.log('res', res);
                },
                function () {
                });
        }
    }
})();