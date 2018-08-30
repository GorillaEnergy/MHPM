;(function () {
    angular
        .module('factory.url', [])
        .factory('url', url);

    url.$inject = [];

    function url() {
        // let baseUrl = 'https://api.mind-hero.grassbusinesslabs.tk/';
        let baseUrl = 'http://api.mind-hero.grassbusinesslabs.tk/';

        return {
            user: {
                login: baseUrl + 'api/login',
            },
            consultant: {
                list: baseUrl + 'api/list-consultants',
            },
            kids: {
                list: baseUrl + 'api/list-paid-kids',
            },
            parents: {
                list: baseUrl + 'api/list-parents',
            }

        };
    }

})();