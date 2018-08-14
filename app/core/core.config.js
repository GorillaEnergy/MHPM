;(function () {
    angular
        .module('app')
        .config(mainConfig);
    mainConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider'];

    function mainConfig($stateProvider, $urlRouterProvider, $mdThemingProvider) {

        $mdThemingProvider
            .theme('blue-grey')
            .accentPalette('blue-grey');

        $urlRouterProvider.otherwise('/authorization');

        $stateProvider

            .state('authorization', {
                url: '/authorization',
                templateUrl: 'templates/authorization/authorization.html',
                controller: 'AuthorizationController',
                controllerAs: 'vm',
            }).state('tabs', {
                url: '/tabs',
                templateUrl: 'templates/tabs/tabs.html',
                controller: 'TabsController',
                controllerAs: 'vm',
            })
            .state('tabs.statistic', {
                url: '/statistic',
                templateUrl: 'templates/statistic/statistic.html',
                controller: 'StatisticController',
                controllerAs: 'vm'
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
                controllerAs: 'vm'
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
                controllerAs: 'vm'
            })
            .state('tabs.call4', {
                url: '/call4',
                templateUrl: 'templates/call4/call4.html',
                controller: 'Call4Controller',
                controllerAs: 'vm'
            })
            .state('tabs.call5', {
                url: '/call5',
                templateUrl: 'templates/call5/call5.html',
                controller: 'Call5Controller',
                controllerAs: 'vm'
            })
            // .state('login', {
            //     url: '/login',
            //     templateUrl: 'templates/login/login.html',
            //     controller: 'LoginController',
            //     controllerAs: 'vm'
            // })
            // .state('registration', {
            //     url: '/register/:token',
            //     templateUrl: 'templates/registration/registration.html',
            //     controller: 'RegistrationController',
            //     controllerAs: 'vm'
            // })
            // .state('forgot', {
            //     url: '/sign-up/forgot',
            //     templateUrl: 'templates/forgot-password/forgot-password.html',
            //     controller: 'ForgotController',
            //     controllerAs: 'vm'
            // })
            // .state('reset', {
            //     url: '/sign-up/reset/:token',
            //     templateUrl: 'templates/reset-password/reset-password.html',
            //     controller: 'ResetController',
            //     controllerAs: 'vm'
            // })
            // .state('tab.user-management', {
            //     url: '/user-management',
            //     templateUrl: 'templates/user-management/user-management.html',
            //     controller: 'UserManagementController',
            //     controllerAs: 'vm',
            //     resolve: {
            //         loadCustomers: function (customerService) {
            //             return customerService.loadCustomers();
            //         },
            //         loadCompany: function (companyService, userService) {
            //             let company = [];
            //             let userRole = userService.getUser().role_id;
            //
            //             if (userRole === 2) {
            //                 company = companyService.loadCompany();
            //             }
            //
            //             return company;
            //         },
            //         security: function ($state, userService) {
            //             let userRole = userService.getUser().role_id;
            //             if (userRole === 3) {
            //                 return $state.go('tab.company');
            //             }
            //         }
            //     },
            //     params: {
            //         data: null
            //     }
            // })
    }
})();