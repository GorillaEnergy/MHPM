;(function () {
    'use strict';
    angular
        .module('app')
        .controller('SendLogController', SendLogController);

    SendLogController.$inject = ['$mdDialog', '$timeout', 'toastr', 'data', 'dateConverter', 'logsService'];

    function SendLogController($mdDialog, $timeout, toastr, data, dateConverter, logsService) {
        let vm = this;

        console.log(data);

        let kid_id = data.kid.id;
        let fb = firebase.database();

        vm.kidName = data.kid.name;
        vm.logs = data.logs;
        vm.text = '';

        vm.consName = consName;
        vm.dateConvert = dateConverter.dateConverter;
        vm.timeConvert = dateConverter.timeConverter;

        vm.send = send;


        function consName(consultant) {
            if (data.consultants[consultant.consultant_id]) {
                return data.consultants[consultant.consultant_id].name
            } else {
                return "No Name"
            }
        }

        function send() {
            let data = {
                content: vm.text,
                kid_id: kid_id,
                status: "normal"
            };

            logsService.sendLog(data).then(function (res) {
                if (res.status === 'success') {
                    toastr.success('Successfully sent');
                    close();
                } else {
                    toastr.error('Sending error')
                }
            })
        }

        function close() {
            $mdDialog.hide()
        }
    }
})();