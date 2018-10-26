;(function () {
    'use strict';
    angular.module('app')
        .controller('StatisticController', StatisticController);

    StatisticController.$inject = ['modalSvc', 'statisticService', 'my_chat', 'my_call', 'my_weekly'];

    function StatisticController(modalSvc, statisticService, my_chat, my_call, my_weekly) {
        let vm = this;
        console.log('StatisticController start');

        vm.toLive = toLive;
        vm.editLiveRoom = editLiveRoom;
        vm.createLiveRoom = createLiveRoom;

        init();

        function init() {
            vm.my_statistic = createStatObj(my_chat);
            prepTime(vm.my_statistic, my_call.time);
            vm.weekly_statistic = createStatObj(my_weekly);
            prepTime(vm.weekly_statistic, my_weekly.time);
            statisticService.getMyContent().then(function (data) {
                vm.schedule = data.data;
            });
        }

        function createStatObj(obj) {
            return {
                chat: obj.chats,
                call: obj.calls,
                time: {hours: '', min: ''},
            };
        }

        function prepTime(obj, time) {
            let arrMyTime = time.split(':');
            obj.time.hours = arrMyTime[0];
            obj.time.min = arrMyTime[1];
        }

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
            let data = {type: 'create'};
            showLiveRoomDialog(data)
        }

        function showLiveRoomDialog(data) {
            modalSvc.liveRoom(data).then(function (res) {
                init();
                console.log('res', res);
            });
        }
    }
})();