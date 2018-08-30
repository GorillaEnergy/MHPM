;(function () {
    'use strict';
    angular
        .module('app')
        .controller('LiveRoomController', LiveRoomController);

    LiveRoomController.$inject = ['$mdDialog', '$timeout', '$window', 'data', 'toastr', 'statisticService'];

    function LiveRoomController($mdDialog, $timeout, $window, data, toastr, statisticService) {
        let vm = this;

        vm.saveRoom = saveRoom;
        vm.createRoom = createRoom;
        vm.removeRoom = removeRoom;
        vm.close = close;

        let image = document.getElementById('file');
        vm.data = {
            date: '04.03.2021',
            time: '09:20',
            name: '',
            img: ''
        };
        resizer();
        checkType(data.type);

        function checkType(type) {
            if (type === 'create') {
                vm.update = false;
            } else {
                vm.update = true;
            }
        }

        function saveRoom() {
            if(!validation()){
                return
            }
            console.log(vm.data)
        }

        function createRoom() {
            if(!validation()){
                return
            }
            console.log(vm.data)
            // statisticService.createContent(data)
        }

        function removeRoom() {
            console.log('removeRoom');
        }

        function close() {
            $mdDialog.hide('close...')
        }

        function validation() {
            if (!vm.data.date){
                toastr.error('check date')
            }
            if (!vm.data.time){
                toastr.error('check time')
            }
            if (vm.data.name === ''){
                toastr.error('check name')
            }
            if (vm.data.date && vm.data.time && vm.data.name !== ''){
                prepareDate();
                return true;
            }
        }

        function prepareDate(){
            vm.data.time = $(".input-time")[0].value;
            vm.data.date = moment(vm.data.date).format('DD.MM.YYYY');
        }

        function resizer() {
            $timeout(function () {
                photoBlockSizing();
            });
            angular.element($window).bind("resize", function () {
                photoBlockSizing();
            });

            function photoBlockSizing() {
                let photoBlock = $("#photo-block");
                let buttonBlock = $("#button-block");
                photoBlock.height(photoBlock.width() * 0.75);
                buttonBlock.width(photoBlock.width());
                // let url = 'http://2.bp.blogspot.com/-j4CaDgx5OR4/T38vw1ULCJI/AAAAAAAABzE/U6sRh4RAK8M/s1600/17992935.jpg';
                // photoBlock.css("background-image", "url(" + url + ")");
            }
        }

        // function bgTest() {
        //     $timeout(function () {
        //         let url = 'http://2.bp.blogspot.com/-j4CaDgx5OR4/T38vw1ULCJI/AAAAAAAABzE/U6sRh4RAK8M/s1600/17992935.jpg';
        //         $("#photo-block").css("background-image","url(" + url + ")");
        //     });
        // }

    }
})();