;(function () {
    'use strict';
    angular.module('app')
        .controller('NewPasswordController', NewPasswordController);

    NewPasswordController.$inject = ['$localStorage', '$state', 'toastr', 'authService'];

    function NewPasswordController($localStorage, $state, toastr, authService) {
       let vm = this;
       console.log('NewPasswordController start');
       vm.save = save;
       vm.warning = {};

       function save() {
           if(validation()){
               if ($localStorage.email){
                    vm.email = $localStorage.email;
               }
               let url = window.location.href;
               let key = url.substring(url.indexOf('new-password/') + 13);
               console.log(key);
               let data = {
                   password: vm.new_password,
                   password_confirmation: vm.new_password_repeat,
                   key: key,
                   email: vm.email
               };
               authService.resetPass(data)
           }
       }

       function validation() {
           if(!vm.new_password){
               vm.warning.new_password = true;
               toastr.error('Minimum length of the password field 9');
           } else {
               if(vm.new_password_repeat !== vm.new_password){
                   vm.warning.new_password_repeat = true;
                   toastr.error('Passwords do not match')
               } else {
                   return true;
               }
           }
       }
    }
})();