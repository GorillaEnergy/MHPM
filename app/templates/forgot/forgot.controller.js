;(function () {
    'use strict';
    angular.module('app')
        .controller('ForgotController', ForgotController);

    ForgotController.$inject = ['$localStorage', '$state', 'toastr', 'authService'];

    function ForgotController($localStorage, $state, toastr, authService) {
        let vm = this;
        console.log('ForgotController start');
        vm.forgot = forgot;
        vm.warning = {};

        function forgot() {
            if (!vm.email) {
                vm.warning.email = true;
                toastr.error('Please enter correct email');
                return;
            }
            let data = {email: vm.email};
            authService.forgotPass(data).then(function (res) {
                if (res.status === "success") {
                    toastr.success(res.message);
                } else {
                    toastr.error(res.message)
                }
            })
        }
    }
})
();