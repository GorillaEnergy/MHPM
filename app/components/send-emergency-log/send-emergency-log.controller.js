;(function () {
    'use strict';
    angular
        .module('app')
        .controller('SendEmergencyLogController', SendEmergencyLogController);

    SendEmergencyLogController.$inject = ['$mdDialog', 'toastr', 'data', 'logsService'];

    function SendEmergencyLogController($mdDialog, toastr, data, logsService) {
        let vm = this;

        // console.log(data);
        vm.send = send;

        let kid_id = data.kid.id;

        function send() {
            let data = {
                content: vm.text,
                kid_id: kid_id,
                status: "emergency"
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