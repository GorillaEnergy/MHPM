;(function () {
    'use strict';
    angular.module('app')
        .controller('StatisticController', StatisticController);

    StatisticController.$inject = ['$localStorage', '$state'];

    function StatisticController($localStorage, $state) {
       let vm = this;
       console.log('StatisticController start');

    }
})();