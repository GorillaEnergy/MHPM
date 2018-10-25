;(function () {
    'use strict';
    angular.module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$localStorage', '$state', 'authService', 'toastr'];

    function LoginController($localStorage, $state, authService, toastr) {
        let vm = this;
        console.log('LoginController start');
        vm.login = login;
        vm.forgot = forgot;

        vm.email = 'tkalenko.yura15@gmail.com';
        vm.password = '111111111';
        vm.warning = {};


        function login() {
            if (!validation()) {
                return;
            }
            authService.login({
                email: vm.email,
                password: vm.password,
                id_number: vm.id,
            });
        }

        function forgot() {
            console.log('forgot');
            $state.go('authorization.forgot')
        }

        function validation() {
            if (!vm.email) {
                vm.warning.email = true;
                toastr.error('Please enter correct email');
            }
            if (!vm.password) {
                vm.warning.password = true;
                toastr.error('Minimum length of the password field 9');
            }
            // if (!vm.id){
            //     vm.warning.id = true;
            //     toastr.error('Minimum length of the id number field 9');
            // }
            return true;
        }
    }
})();