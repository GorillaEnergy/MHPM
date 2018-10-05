;(function () {
    'use strict';
    angular.module('app')
        .controller('CallController', CallController);

    CallController.$inject = ['$localStorage', '$state', '$timeout'];

    function CallController($localStorage, $state, $timeout) {
        console.log('call test ctrl start');
        let vm = this;

        vm.add = add;

        let body = document.getElementById('body-div');
        let local = document.getElementById('vid-thumb');
        let remote = document.getElementById('vid-box');
        let number = 0;

        function add() {
            addElm();
        }
        
        function addElm() {
            number++; //number должно инжектится
            let div = document.createElement('div');
            remote.appendChild(div);

            if (number < 3) {
                removeClasses();
                body.classList.add('less-than-two');
            } else if (number < 4) {
                removeClasses();
                body.classList.add('less-than-three');
            } else {
                removeClasses();
                body.classList.add('more');
            }

            function removeClasses() {
                body.classList.remove('less-than-two');
                body.classList.remove('less-than-three');
                body.classList.remove('more');
            }
        }

    }
})();