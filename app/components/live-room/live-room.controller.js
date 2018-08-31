;(function () {
    'use strict';
    angular
        .module('app')
        .controller('LiveRoomController', LiveRoomController);

    LiveRoomController.$inject = ['$mdDialog', '$timeout', '$window', 'data', 'toastr', 'statisticService', '$localStorage'];

    function LiveRoomController($mdDialog, $timeout, $window, data, toastr, statisticService, $localStorage) {
        let vm = this;

        vm.saveRoom = saveRoom;
        vm.createRoom = createRoom;
        vm.removeRoom = removeRoom;
        vm.close = close;
        let send = {};
        // let image = document.getElementById('file');
        let fd = new FormData();

        vm.data = {
            date: null,
            time: null,
            name: '',
            image: null
        };

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
                    image:  data.el.image
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
                    vm.data.img = res.data.image;
                    $mdDialog.hide('close...')
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
                let photoBlock = $("#photo-block");
                let buttonBlock = $("#button-block");
                photoBlock.height(photoBlock.width() * 0.75);
                buttonBlock.width(photoBlock.width());
                // let url = 'http://2.bp.blogspot.com/-j4CaDgx5OR4/T38vw1ULCJI/AAAAAAAABzE/U6sRh4RAK8M/s1600/17992935.jpg';
                // photoBlock.css("background-image", "url(" + url + ")");
            }
        }

        // function prepImg() {
        //     let img = $('#file')[0].files[0];
        //     fd.append('image', img);
        //      // send.image = fd;
        // }
    }
})();