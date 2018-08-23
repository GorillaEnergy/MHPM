;(function () {
    angular.module('app',
        [
            'app.core',
            'blocks.directives',
            'blocks.request',
            'blocks.services',
            'blocks.filters',

        ])
        .run(runBlock);

    runBlock.$inject = ['webrtc', 'rtcController'];

    function runBlock(webrtc, rtcController) {
        // console.log('runBlock start');

        let config = {
            apiKey: "AIzaSyCPyHbouuqslfJIbAynfdeCHlJb_2tJw9M",
            authDomain: "mind-hero-96b57.firebaseapp.com",
            databaseURL: "https://mind-hero-96b57.firebaseio.com",
            projectId: "mind-hero-96b57",
            storageBucket: "mind-hero-96b57.appspot.com",
            messagingSenderId: "19872374786"
        };
        firebase.initializeApp(config);

    }
})();