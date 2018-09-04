;(function () {
    'use strict';

    angular
        .module('service.tabsService', [])
        .service('tabsService', tabsService);

    tabsService.$inject = ['http', 'url', '$sessionStorage', '$localStorage' , '$state', '$mdDialog'];

    function tabsService(http, url, $sessionStorage, $localStorage, $state, $mdDialog) {
        let model = {};

        model.logout = logout;
        // model.profile = profile;
        model.startTab = startTab;
        model.route = route;

        return model;

        function logout() {
            console.log('logout');

            $localStorage.$reset();
            $sessionStorage.$reset();
            $state.go('authorization.login')
            // return http.get(url.logout_func($localStorage.token).logout);
        }
        // function profile() {
        //     console.log('profile');
        // }

        function startTab(activeTab) {
            $mdDialog.cancel();
        }

        function route(to_state) {
            if ($state.$current.name !== to_state) {
                $state.go(to_state)
            }
        }
    }
})();