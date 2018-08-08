;(function () {
    'use strict';

    angular
        .module('service.statisticService', [])
        .service('statisticService', statisticService);

    statisticService.$inject = ['http', 'url' , '$sessionStorage'];

    function statisticService(http, url ,  $sessionStorage) {
        let model = {};

        model.schedule = schedule;

        return model;

        function schedule() {
            let data = [
                {
                    day: 'sun',
                    data: [
                        {
                            time: '17:00',
                            title: 'class title',
                            live: true
                        },
                        {
                            time: '20:00',
                            title: 'class title long long long long',
                            live: false
                        }
                    ]
                },
                {
                    day: 'mon',
                    data: [
                        {
                            time: '17:00',
                            title: 'class title',
                            live: false
                        },
                        {
                            time: '20:00',
                            title: 'class title',
                            live: false
                        }
                    ]
                },
                {
                    day: 'tue',
                    data: [
                        {
                            time: '17:00',
                            title: 'class title',
                            live: false
                        },
                        {
                            time: '20:00',
                            title: 'class title',
                            live: false
                        }
                    ]
                },
            ];

            return data
        }
    }
})();