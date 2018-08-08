;(function () {
    'use strict';
    angular
        .module('app')
        .controller('LiveRoomController', LiveRoomController);

    LiveRoomController.$inject = ['$mdDialog', '$timeout', '$window', 'data', 'toastr'];

    function LiveRoomController($mdDialog, $timeout, $window, data, toastr) {
        let vm = this;

        vm.editRoom = editRoom;
        vm.createRoom = createRoom;
        vm.removeRoom = removeRoom;
        vm.close = close;

        vm.showEditButton = showEditButton;
        vm.showCreateButton = showCreateButton;
        vm.showRemoveButton = showRemoveButton;
        vm.showCloseButton = showCloseButton;

        console.log(data);
        let image = document.getElementById('file');

        initialize();

        function initialize() {
            popupType();
            resizer();

            bgTest();
        }


        function editRoom() {
            console.log('updateRoom');
        }
        function createRoom() {
            console.log('createRoom');
            let date = new Date(vm.date);
            let time = new Date(vm.time);

            console.log(vm.name);
            console.log(date);
            console.log(time.getHours() + ':' + time.getMinutes());
        }
        function removeRoom() {
            console.log('removeRoom');
        }
        function close() {
            console.log('close');
            $mdDialog.hide('close...')
        }

        function showEditButton() {
            return vm.type === 'update';
        }
        function showCreateButton() {
            return vm.type === 'create';
        }
        function showRemoveButton() {
            return vm.type === 'update';
        }
        function showCloseButton() {
            return vm.type === 'create';
        }

        function popupType() {
            data.type === 'create' ? vm.type = 'create' : vm.type = 'update';
            console.log(vm.type);
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
            }
        }

        function bgTest() {
            $timeout(function () {
                let url = 'http://2.bp.blogspot.com/-j4CaDgx5OR4/T38vw1ULCJI/AAAAAAAABzE/U6sRh4RAK8M/s1600/17992935.jpg';
                $("#photo-block").css("background-image","url(" + url + ")");
            });
        }

    }
})();