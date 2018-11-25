;(function () {
    angular
        .module('factory.url', [])
        .factory('url', url);

    url.$inject = [];

    function url() {
        let baseUrl = 'https://api.mind-hero.grassbusinesslabs.tk/';
        // let baseUrl = 'http://api.mind-hero.grassbusinesslabs.tk/';

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
            },
            statistics: {
                chat_today: baseUrl + 'api/statistics/my/chat/today',
                call_today: baseUrl + 'api/statistics/my/call/today',
                weekly: baseUrl + 'api/statistics/my/weekly',
                add: baseUrl + 'api/statistics/add'
            },
            create_content: baseUrl + 'api/create-content',
            update_content: baseUrl + 'api/update-content',
            delete_content: baseUrl + 'api/delete-content',
            content_my: baseUrl + 'api/content/my',
            password: {
                forgot: baseUrl + 'api/password/forgot',
                reset: baseUrl + 'api/password/reset'
            },
            schedule: {
                create: baseUrl + 'api/schedule/create',
                update: baseUrl + 'api/schedule/update',
                delete: baseUrl + 'api/schedule/delete',
                approve: baseUrl + 'api/schedule/approve',
                visible: baseUrl + 'api/schedule/visible',
                getMySchedules: baseUrl + 'api/schedules/my',
                getSchedules: baseUrl + 'api/schedules',
                getMySchedulesWeeks: baseUrl + 'api/schedules/my/weeks'
            },
            logs: {
                send: baseUrl + 'api/create-log'
            },

            rtc_servers: {
                all: baseUrl + 'api/servers'
            }

        };
    }

})();