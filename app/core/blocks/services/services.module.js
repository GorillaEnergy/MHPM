;(function () {
    'use strict';

    angular.module('blocks.services', [
        'service.authService',
        'service.userService',
        'service.tabsService',
        'service.statisticService',
        'service.scheduleService',
        'service.webrtc',
        'service.rtcController',
        'service.RTCService',
        'service.dateConverter',
        'service.consultantService',
        'service.logsService',
    ]);

})();