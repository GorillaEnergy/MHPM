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

    runBlock.$inject = ['webrtc', 'rtcController', 'RTCService','firebaseSvc'];

    function runBlock(webrtc, rtcController, RTCService, firebaseSvc) {
        // console.log('runBlock start');
        firebaseSvc.init();
    }
})();