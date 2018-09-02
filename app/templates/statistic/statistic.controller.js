;(function () {
    'use strict';
    angular.module('app')
        .controller('StatisticController', StatisticController);

    StatisticController.$inject = ['$mdDialog', 'statisticService', 'my_chat', 'my_call', 'my_weekly'];

    function StatisticController($mdDialog, statisticService, my_chat, my_call, my_weekly) {
        let vm = this;
        console.log('StatisticController start');

        vm.toLive = toLive;
        vm.editLiveRoom = editLiveRoom;
        vm.createLiveRoom = createLiveRoom;

        getContent();

        // var container = $('.container'), inputFile = $('#file'), img, btn, txt = 'Browse', txtAfter = 'Browse another pic';
        //
        // if(!container.find('#upload').length){
        //     container.find('.input').append('<input type="button" value="'+txt+'" id="upload">');
        //     btn = $('#upload');
        //     container.prepend('<img src="" class="hidden" alt="Uploaded file" id="uploadImg" width="100">');
        //     img = $('#uploadImg');
        // }
        //
        // btn.on('click', function(){
        //     inputFile.click();
        // });
        //
        // inputFile.on('change', function(e){
        //     container.find('label').html( inputFile.val() );
        //
        //     var i = 0;
        //     for(i; i < e.originalEvent.srcElement.files.length; i++) {
        //         var file = e.originalEvent.srcElement.files[i],
        //             reader = new FileReader();
        //
        //         reader.onloadend = function(){
        //             img.attr('src', reader.result).animate({opacity: 1}, 700);
        //         };
        //         reader.readAsDataURL(file);
        //         img.removeClass('hidden');
        //     }
        //
        //     btn.val( txtAfter );
        // });

        function getContent () {
           vm.my_statistic = {
               chat: my_chat.chats,
               call: my_call.calls,
               time: {hours: '', min: ''},
           };
           prepTime(vm.my_statistic , my_call.time);
           vm.weekly_statistic = {
               chat: my_weekly.chats,
               call: my_weekly.calls,
               time: {hours: '', min: ''},
           };
            prepTime(vm.weekly_statistic , my_weekly.time);
            statisticService.getMyContent().then(function (data) {
                vm.schedule = data.data;
            })
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
            let data = { type: 'create' };
            showLiveRoomDialog(data)
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
                    getContent();
                    console.log('close dialog');
                    console.log('res', res);
                },
                function () {
                });
        }
    }
})();