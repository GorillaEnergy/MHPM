;(function () {
    'use strict';
    angular.module('app')
        .controller('TabsController', TabsController);

    TabsController.$inject = ['$localStorage', '$state', 'tabsService'];

    function TabsController($localStorage, $state, tabsService) {
       let vm = this;
       console.log('TabsController start');

       vm.logout = logout;
       vm.profile = profile;

       vm.toStatistic = toStatistic;
       vm.toSchedule = toSchedule;
       vm.toChat = toChat;

       function logout() {
           tabsService.logout()
       }
       function profile() {
           tabsService.profile()
       }

       function toStatistic() {
          tabsService.route('tabs.statistic');
       }
       function toSchedule() {
          tabsService.route('tabs.schedule');
       }
       function toChat() {
           tabsService.route('tabs.chat');
       }
    }
})();