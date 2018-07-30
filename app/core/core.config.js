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