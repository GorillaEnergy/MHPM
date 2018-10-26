;(function () {
    'use strict';

    angular
        .module('service.firebaseSvc', [])
        .service('firebaseSvc', firebaseSvc);

    firebaseSvc.$inject = ['http', 'url', 'toastr'];

    function firebaseSvc(http, url, toastr) {
        var handlerDB = null;
        var countTry = 0;
        var model = {
            init: init,
            check: check,
            db: db
        };

        var config = {
            apiKey: "AIzaSyCPyHbouuqslfJIbAynfdeCHlJb_2tJw9M",
            authDomain: "mind-hero-96b57.firebaseapp.com",
            databaseURL: "https://mind-hero-96b57.firebaseio.com",
            projectId: "mind-hero-96b57",
            storageBucket: "mind-hero-96b57.appspot.com",
            messagingSenderId: "19872374786"
        };

        function init() {
            if (check()) {
                window.firebase.initializeApp(config);
                handlerDB = window.firebase.database();
            } else {
                toastr.error('Firebase not available!');
            }
        }

        function check() {
            return window.firebase;
        }

        function db() {
            if (!handlerDB) {
                if(countTry++ < 5){
                    init();
                    return db();
                }
                countTry = 0;
                toastr.error('Firebase database don\'t work!');
            } else {
                return handlerDB;
            }
        }

        return model;
    }
})();