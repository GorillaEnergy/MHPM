;(function () {
    'use strict';
    angular.module('app')
        .controller('ForgotController', ForgotController);

    ForgotController.$inject = ['$localStorage', '$state'];

    function ForgotController($localStorage, $state) {
       let vm = this;
       console.log('ForgotController start');
       vm.forgot = forgot;


       function forgot() {
          console.log('forgot');
          let data = { email: vm.email };
          console.log(data);
       }
    }
})();