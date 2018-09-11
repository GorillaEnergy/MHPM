;(function () {
    'use strict';

    angular
        .module('service.autologinService', [])
        .service('autologinService', autologinService);

    autologinService.$inject = ['http', 'url', '$localStorage', '$state'];

    function autologinService(http, url, $localStorage, $state) {

        let model = {};
        model.authorization = authorization;

        return model;

        function authorization() {
            if ($localStorage.token) {
                return $state.go('tabs.statistic')
            } else {
                return $state.go('authorization.login')
            }
        }
    }
})();