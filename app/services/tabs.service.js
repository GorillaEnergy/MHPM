;(function () {
    'use strict';

    angular
        .module('service.tabsService', [])
        .service('tabsService', tabsService);

    tabsService.$inject = ['http', 'url', '$sessionStorage', '$localStorage' , '$state', '$mdDialog', 'RTCService'];

    function tabsService(http, url, $sessionStorage, $localStorage, $state, $mdDialog, RTCService) {
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
                if (RTCService.accessToGo()) {
                    $state.go(to_state)
                } else {
                    showWarning()
                }
            }
        }

        function showWarning() {
            console.log('showWarning()');
            $mdDialog.show({
                controller: 'StateGoWarning',
                controllerAs: 'vm',
                templateUrl: 'components/state-go-warning/state-go-warning.html',
                clickOutsideToClose: true
            })
        }
    }
})();