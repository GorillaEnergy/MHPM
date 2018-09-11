;(function () {
    angular
        .module('app')
        .config(mainConfig);
    mainConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider'];

    function mainConfig($stateProvider, $urlRouterProvider, $mdThemingProvider) {

        $mdThemingProvider
            .theme('blue-grey')
            .accentPalette('blue-grey');

        $urlRouterProvider.otherwise('/authorization/login');

        $stateProvider

            .state('authorization', {
                url: '/authorization',
                templateUrl: 'templates/authorization/authorization.html',
                controller: 'AuthorizationController',
                controllerAs: 'vm',
                resolve: {
                    autologin: function (autologinService) {
                        return autologinService.autologin();
                    }
                }
            }).state('authorization.login', {
                url: '/login',
                templateUrl: 'templates/login/login.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            }).state('authorization.forgot', {
                url: '/forgot',
                templateUrl: 'templates/forgot/forgot.html',
                controller: 'ForgotController',
                controllerAs: 'vm'
            }).state('authorization.new-password', {
                url: '/new-password',
                templateUrl: 'templates/new-password/new-password.html',
                controller: 'NewPasswordController',
                controllerAs: 'vm'
            }).state('tabs', {
                url: '/tabs',
                templateUrl: 'templates/tabs/tabs.html',
                controller: 'TabsController',
                controllerAs: 'vm',
                resolve: {
                    autologin: function (autologinService) {
                        return autologinService.autologout();
                    }
                }
            })
            .state('tabs.statistic', {
                url: '/statistic',
                templateUrl: 'templates/statistic/statistic.html',
                controller: 'StatisticController',
                controllerAs: 'vm',
                resolve: {
                    my_chat: function (statisticService) {
                        return statisticService.getMyChatStatistic()
                    },
                    my_call: function (statisticService) {
                        return statisticService.getMyCallStatistic()
                    },
                    my_weekly: function (statisticService) {
                        return statisticService.getMyWeeklyStatistic()
                    },

                }
            })
            .state('tabs.schedule', {
                url: '/schedule',
                templateUrl: 'templates/schedule/schedule.html',
                controller: 'ScheduleController',
                controllerAs: 'vm'
            })
            .state('tabs.chat', {
                url: '/chat',
                templateUrl: 'templates/chat/chat.html',
                controller: 'ChatController',
                controllerAs: 'vm',
                resolve: {
                    consultants: function (userService) {
                        return userService.getConsultantList();
                    },
                    kids: function (userService) {
                        return userService.getKidsList();
                    }
                },
                params: {
                    to_call: null
                }

            })
            .state('tabs.call', {
                url: '/call',
                templateUrl: 'templates/call/call.html',
                controller: 'CallController',
                controllerAs: 'vm'
            })
            .state('tabs.call2', {
                url: '/call2',
                templateUrl: 'templates/call2/call2.html',
                controller: 'Call2Controller',
                controllerAs: 'vm'
            })
            .state('tabs.call3', {
                url: '/call3',
                templateUrl: 'templates/call3/call3.html',
                controller: 'Call3Controller',
                controllerAs: 'vm',
                resolve: {
                    consultants: function (userService) {
                        return userService.getConsultantList();
                    },
                    kids: function (userService) {
                        return userService.getKidsList();
                    }
                }
            })
            .state('tabs.video-chat-test', {
                url: '/video-chat-test',
                templateUrl: 'templates/call4/call4.html',
                controller: 'Call4Controller',
                controllerAs: 'vm',
                resolve: {
                    consultants: function (userService) {
                        return userService.getConsultantList();
                    },
                    kids: function (userService) {
                        return userService.getKidsList();
                    }
                }
            })
            .state('tabs.call5', {
                url: '/call5',
                templateUrl: 'templates/call5/call5.html',
                controller: 'Call5Controller',
                controllerAs: 'vm'
            })
    }
})();