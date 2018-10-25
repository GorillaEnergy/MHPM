;(function () {
    'use strict';

    angular
        .module('service.tabsService', [])
        .service('tabsService', tabsService);

    tabsService.$inject = ['$state', 'RTCService', 'modalSvc'];

    function tabsService( $state, RTCService, modalSvc) {
        let model = {};
        model.startTab = startTab;
        model.route = route;

        return model;

        function startTab(activeTab) {
            modalSvc.cancel();
        }

        function route(to_state) {
            if ($state.$current.name !== to_state) {
                if (RTCService.accessToGo()) {
                    $state.go(to_state)
                } else {
                    modalSvc.warningStateGo()
                }
            }
        }
    }
})();