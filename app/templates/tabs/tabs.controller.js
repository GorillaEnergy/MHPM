;(function () {
    'use strict';
    angular.module('app')
        .controller('TabsController', TabsController);

    TabsController.$inject = ['$localStorage', '$state', '$timeout', '$window', 'tabsService', 'authService', 'firebaseDataSvc'];

    function TabsController($localStorage, $state, $timeout, $window, tabsService, authService, firebaseDataSvc) {
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

        init();

        function init() {
           firebaseDataSvc.setMask($localStorage.user.id, {
                x: 0, y:0, rotX:0, rotY: 0, rotZ: 0, scale: 0
            });


               // firebaseDataSvc.setMask($localStorage.user.id, {
               //     x: Math.floor(Math.random() * 10), y:Math.floor(Math.random() * 10), rotX:0, rotY: 0, rotZ: 0, scale: 0
               // });

        }

        function toggleMenu() {
            vm.menuOpen = !vm.menuOpen;
        }

        $timeout(function () {
            resizeBody();
        });

        angular.element($window).bind("resize", function (e) {
            resizeBody(true);
        });

        function resizeBody(page_ready) {
            let main = $("#tabs-main");
            let header = $("#tabs-header");
            let body = $("#tabs-body");

            if (body.height() < 560 && page_ready) {
                body.height(560);
            } else {
                body.height(main.height() - header.height() - 2);
            }
        }

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