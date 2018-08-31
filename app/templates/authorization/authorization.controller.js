;(function () {
    'use strict';
    angular.module('app')
        .controller('AuthorizationController', AuthorizationController);

    AuthorizationController.$inject = ['$localStorage', '$state'];

    function AuthorizationController($localStorage, $state) {
       let vm = this;
       console.log('AuthorizationController start');
    }
})();