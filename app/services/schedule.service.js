;(function () {
    'use strict';

    angular
        .module('service.scheduleService', [])
        .service('scheduleService', scheduleService);

    scheduleService.$inject = ['http', 'url', '$sessionStorage'];

    function scheduleService(http, url, $sessionStorage) {
        let model = {};

        model.busyOnWeek = busyOnWeek;

        return model;

        function busyOnWeek() {
            let data = [
                {
                    day: 'sun',
                    time: [
                        {
                            start: '10:00',
                            end: '12:00'
                        },
                        {
                            start: '14:00',
                            end: '16:00'
                        },
                    ]

                },
                {
                    day: 'mon',
                    time: [
                        {
                            start: '10:00',
                            end: '12:00'
                        },
                        {
                            start: '14:00',
                            end: '16:00'
                        },
                    ]

                },
                {
                    day: 'tue',
                    time: [
                        {
                            start: '10:00',
                            end: '12:00'
                        },
                        {
                            start: '14:00',
                            end: '16:00'
                        },
                    ]

                },
                {
                    day: 'wed',
                    time: [
                        {
                            start: '10:00',
                            end: '12:00'
                        },
                        {
                            start: '14:00',
                            end: '16:00'
                        },
                    ]

                },
                {
                    day: 'thu',
                    time: [
                        {
                            start: '10:00',
                            end: '12:00'
                        },
                        {
                            start: '14:00',
                            end: '16:00'
                        },
                    ]

                },
                {
                    day: 'fri',
                    time: [
                        {
                            start: '10:00',
                            end: '12:00'
                        },
                        {
                            start: '14:00',
                            end: '16:00'
                        },
                    ]

                },
                {
                    day: 'sat',
                    time: [
                        {
                            start: '10:00',
                            end: '12:00'
                        },
                        {
                            start: '14:00',
                            end: '16:00'
                        },
                    ]

                }
            ];

            return data
        }
    }
})();