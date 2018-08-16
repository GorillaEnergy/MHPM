;(function () {
    'use strict';
    angular.module('app')
        .controller('NewPasswordController', NewPasswordController);

    NewPasswordController.$inject = ['$localStorage', '$state'];

    function NewPasswordController($localStorage, $state) {
       let vm = this;
       console.log('NewPasswordController start');
       vm.save = save;

       function save() {
          console.log('save');
          let data = {
              password: vm.new_password
          };
          console.log(data);
       }
    }
})();