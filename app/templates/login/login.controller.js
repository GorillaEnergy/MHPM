;(function () {
    'use strict';
    angular.module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$localStorage', '$state', 'authService'];

    function LoginController($localStorage, $state, authService) {
       let vm = this;
       console.log('LoginController start');
       vm.login = login;
       vm.forgot = forgot;


       vm.email = 'test.consultant.1@gmail.com';
       vm.password = '12345678';


       function login() {
          console.log('login');
          let data = {
              email: vm.email,
              password: vm.password,
              id_number: vm.id,
          };
           // console.log(data);
           authService.login(data)
       }
       function forgot() {
          console.log('forgot');
          $state.go('authorization.forgot')
       }
    }
})();