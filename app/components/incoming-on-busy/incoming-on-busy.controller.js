;(function () {
    'use strict';
    angular.module('app')
        .controller('IncomingOnBusyController', IncomingOnBusyController);

    IncomingOnBusyController.$inject = ['$mdDialog', 'dateConverter', 'consultantService', 'data'];

    function IncomingOnBusyController($mdDialog, dateConverter, consultantService, data) {
        let vm = this;
        vm.opponent_name = data.opponent_name;
        vm.logs = data.logs;
        let consultantsObj = consultantService.convert(data.consultants);
        vm.dateConvert = dateConverter.dateConverter;
        vm.timeConvert = dateConverter.timeConverter;
        vm.consName = consName;
        vm.addToCurrent = addToCurrent;
        vm.toChat = toChat;
        vm.reject = reject;

        function consName(consultant) {
            if (consultantsObj[consultant.consultant_id]) {
                return consultantsObj[consultant.consultant_id].name
            } else {
                return "No Name"
            }
        }

        function addToCurrent() {
            close({accept: true})
        }
        function toChat() {
            close({accept: 'chat'})
        }
        function reject() {
            close({accept: false})

        }

        function close(data) {
            $mdDialog.hide(data);
        }
    }
})();