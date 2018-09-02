;(function () {
    'use strict';
    angular
        .module('app')
        .controller('LiveRoomController', LiveRoomController);

    LiveRoomController.$inject = ['$mdDialog', '$timeout', '$window', 'data', 'toastr', 'statisticService', '$localStorage', '$scope'];

    function LiveRoomController($mdDialog, $timeout, $window, data, toastr, statisticService, $localStorage, $scope) {
        let vm = this;

        vm.saveRoom = saveRoom;
        vm.createRoom = createRoom;
        vm.removeRoom = removeRoom;
        vm.close = close;

        let send = {};
        // let image = document.getElementById('file');
        let fd = new FormData();

        vm.data = {};
        // vm.photoBlock = $('#photo-block');

        init();

        function init() {
            resizer();
            checkType(data);
        }

        function checkType(data) {
            if (data.type === 'create') {
                vm.update = false;
            } else {
                let g = moment(data.el.date, 'DD.MM.YYYY').format('YYYY-MM-DD');
                let t = moment(g + 'T' + data.el.time, 'YYYY-MM-DDTHH:mm:SS').format('YYYY-MM-DDTHH:mm:SS');
                vm.data = {
                    date: new Date(t),
                    time: new Date(t),
                    name: data.el.name,
                    image: data.el.image
                };
                vm.update = true;
            }
        }

        function saveRoom() {
            if (!validation()) {
                return
            }
            prepareData();
            // statisticService.createContent(fd).then(function (res) {
            //     console.log(res);
            // });
        }

        function createRoom() {
            if (!validation()) {
                return
            }
            prepareData();
            statisticService.createContent(fd).then(function (res) {
                if (res.status === 'success') {
                    // $mdDialog.hide('close...')
                }
            });
        }

        function removeRoom() {
            console.log('removeRoom');
            let send_id = {
                content_id: data.el.id
            };
            statisticService.deleteContent(send_id).then(function (res) {
                if (res.status === 'success') {
                    $mdDialog.hide('close...')
                }
            })
        }

        function close() {
            $mdDialog.hide('close...')
        }

        function validation() {
            if (!vm.data.date) {
                toastr.error('check date')
            }
            if (!vm.data.time) {
                toastr.error('check time')
            }
            if (vm.data.name === '') {
                toastr.error('check name')
            }
            if (vm.data.date && vm.data.time && vm.data.name !== '') {
                return true;
            }
        }

        function prepareData() {
            // prepImg();
            send.date = moment(vm.data.date).format('DD.MM.YYYY');
            send.time = moment(vm.data.time).format('HH:mm');
            send.name = vm.data.name;
            fd.append('date', send.date);
            fd.append('time', send.time);
            fd.append('name', send.name);
            let img = $('#file')[0].files[0];
            fd.append('image', img);
        }

        function resizer() {
            $timeout(function () {
                photoBlockSizing();
            });
            angular.element($window).bind("resize", function () {
                photoBlockSizing();
            });

            function photoBlockSizing() {
                vm.photoBlock = $("#photo-block");
                let buttonBlock = $("#button-block");
                vm.photoBlock.height(vm.photoBlock.width() * 0.75);
                buttonBlock.width(vm.photoBlock.width());
                vm.photoBlock.css("background-image", "url(" +  vm.data.image + ")");
            }
        }

        $scope.prepImg = function() {
            let reader = new FileReader();

            reader.onload = function (e) {
               vm.photoBlock.css("background-image", "url(" +  e.target.result + ")");
                $('.photo').css("display", "none")
            };
            let img = $('#file')[0].files[0];
            reader.readAsDataURL(img);
        }
    }
})();