;(function () {
    'use strict';

    angular
        .module('service.statisticService', [])
        .service('statisticService', statisticService);

    statisticService.$inject = ['http', 'url' , '$sessionStorage'];

    function statisticService(http, url ,  $sessionStorage) {
        let model = {};

        model.schedule = schedule;
        model.createContent = createContent;
        model.deleteContent = deleteContent;
        model.getMyContent = getMyContent;

        return model;

        function createContent(data) {
            return http.file(url.create_content, data,);
        }
        function deleteContent(data) {
            return http.post(url.delete_content, data)
        }
        function getMyContent() {
            return http.get(url.content_my)
        }

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