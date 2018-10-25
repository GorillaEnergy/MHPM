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

    runBlock.$inject = ['webrtc', 'rtcController', 'RTCService','firebaseSvc', 'utilsSvc'];

    function runBlock(webrtc, rtcController, RTCService, firebaseSvc, utilsSvc) {
        firebaseSvc.init();
        utilsSvc.init();
    }
})();