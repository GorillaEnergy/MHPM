;(function () {
    'use strict';
    angular.module('app')
        .controller('IncomingOnBusyController', IncomingOnBusyController);

    IncomingOnBusyController.$inject = ['$mdDialog', 'dateConverter', 'data'];

    function IncomingOnBusyController($mdDialog, dateConverter, data) {
        let vm = this;

        console.log(data);
        // vm.opponent_name = data.opponent_name;
        // vm.logs = data.logs;
        // let consultantsObj = data.consultantsObj || [];
        //
        // vm.consName = consName;
        // vm.dateConvert = dateConverter.dateConverter;
        // vm.timeConvert = dateConverter.timeConverter;
        // vm.addToCurrent = addToCurrent;
        // vm.toChat = toChat;
        // vm.reject = reject;
        //
        // function consName(consultant) {
        //     if (consultantsObj[consultant.consultant_id]) {
        //         return consultantsObj[consultant.consultant_id].name
        //     } else {
        //         return "No Name"
        //     }
        // }
        //
        // function addToCurrent() {
        //     close({accept: true})
        // }
        // function toChat() {
        //     close({accept: 'chat'})
        // }
        // function reject() {
        //     close({accept: false})
        //
        // }
        //
        // function close(data) {
        //     $mdDialog.hide(data);
        // }
    }
})();