;(function () {
    'use strict';
    angular.module('app')
        .controller('AuthorizationController', AuthorizationController);

    AuthorizationController.$inject = ['$localStorage', '$state'];

    function AuthorizationController($localStorage, $state) {
       let vm = this;
       console.log('AuthorizationController start');
       vm.login = login;
       vm.forgot = forgot;
       vm.save = save;


       vm.view = {login: true, forgot: false, new_password: false};
       // vm.view = {login: false, forgot: true, new_password: false};
       // vm.view = {login: false, forgot: false, new_password: true};

       function login() {
          console.log('login');
       }
       function forgot() {
          console.log('forgot');
       }
       function save() {
          console.log('save');
       }
    }
})();