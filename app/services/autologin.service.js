;(function () {
    'use strict';

    angular
        .module('service.autologinService', [])
        .service('autologinService', autologinService);

    autologinService.$inject = ['http', 'url', '$localStorage', '$state'];

    function autologinService(http, url, $localStorage, $state) {

        let model = {};
        model.autologin = autologin;
        model.autologout = autologout;

        return model;

        function autologin() {
            if ($localStorage.token) {
                return $state.go('tabs.statistic')
            }
        }

        function autologout() {
            if (!$localStorage.token) {
                $localStorage.$reset();
                return $state.go('authorization.login')
            }
        }
    }
})();