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
        let prep_date = $localStorage.data;
        let send = {};
        let image = document.getElementById('file');

        vm.data = {
            date: null,
            time: null,
            name: '',
            img: ''
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
                    img: ''
                };
                vm.update = true;
            }
        }

        function saveRoom() {
            if(!validation()){
                return
            }
            prepareData();
            statisticService.createContent(send).then(function (res) {
                console.log(res);
            });
        }

        function createRoom() {
            if(!validation()){
                return
            }
            prepareData();
            statisticService.createContent(send).then(function (res) {
                $localStorage.data = res.data;
                $mdDialog.hide('close...')
            });
        }

        function removeRoom() {
            console.log('removeRoom');
            statisticService.deleteComment(data.el.id).then(function (res) {
                console.log(res);
            })
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
                return true;
            }
        }

        function prepareData(){
            send.date = moment(vm.data.date).format('DD.MM.YYYY');
            send.time = moment(vm.data.time).format('HH:mm');
            send.name = vm.data.name;
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