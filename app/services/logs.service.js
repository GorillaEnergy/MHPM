;(function () {
    'use strict';

    angular
        .module('service.logsService', [])
        .service('logsService', logsService);

    logsService.$inject = ['http', 'url'];

    function logsService(http, url) {

        let model = {};
        model.sendLog = sendLog;


        return model;

        function sendLog(data) {
            return http.post(url.logs.send, data);
        }
    }
})();