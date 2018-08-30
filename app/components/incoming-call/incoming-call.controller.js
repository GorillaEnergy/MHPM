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

        let fb = firebase.database();

        console.log(data);
        let image = document.getElementById('file');

        initialize();

        function initialize() {
            popupType();
            resizer();
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
            data.type === 'new' ? vm.type = 'new' : vm.type = 'add';
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

    }
})();