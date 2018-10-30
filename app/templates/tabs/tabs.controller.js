;(function () {
    'use strict';
    angular.module('app')
        .controller('TabsController', TabsController);

    TabsController.$inject = ['$localStorage', '$state', '$timeout', '$window', 'tabsService', 'authService'];

    function TabsController($localStorage, $state, $timeout, $window, tabsService, authService) {
        let vm = this;
        console.log('TabsController start');

        vm.logout = logout;
        // vm.profile = profile;
        vm.toStatistic = toStatistic;
        vm.toSchedule = toSchedule;
        vm.toChat = toChat;
        vm.toVideoChatTest = toVideoChatTest;
        vm.toggleMenu = toggleMenu;
        vm.menuOpen = true;
        vm.user = authService.getUser();
        function toggleMenu(){
            vm.menuOpen = !vm.menuOpen;
        }

       // $timeout(function () { resizeBody(); });
       // angular.element($window).bind("resize",function(e){ resizeBody(true); });
       //
       // function resizeBody(page_ready) {
       //     let main = $("#tabs-main");
       //     let header = $("#tabs-header");
       //     let body = $("#tabs-body");
       //
       //     if (body.height() < 560 && page_ready) {
       //         body.height(560);
       //     } else {
       //         body.height(main.height() - header.height() - 2);
       //     }
       // }

       function logout() {
           authService.logout()
       }
       // function profile() {
       //     tabsService.profile()
       // }

       function toStatistic() {
          tabsService.route('tabs.statistic');
       }
       function toSchedule() {
          tabsService.route('tabs.schedule');
       }
       function toChat() {
           tabsService.route('tabs.chat');
       }
       function toVideoChatTest() {
           tabsService.route('tabs.video-chat-test');
       }
    }
})();