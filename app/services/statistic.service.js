;(function () {
    'use strict';

    angular
        .module('service.statisticService', [])
        .service('statisticService', statisticService);

    statisticService.$inject = ['http', 'url' , '$sessionStorage'];

    function statisticService(http, url ,  $sessionStorage) {
        let model = {};

        model.createContent = createContent;
        model.deleteContent = deleteContent;
        model.getMyContent = getMyContent;
        model.getMyChatStatistic = getMyChatStatistic;
        model.getMyCallStatistic = getMyCallStatistic;
        model.getMyWeeklyStatistic = getMyWeeklyStatistic;
        model.addStatistic = addStatistic;

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
        function getMyChatStatistic () {
            return http.get(url.statistics.chat_today).then(function (res) {
                if (res.status === 'success') {
                    return res.data;
                } else {
                    return []
                }
            })
        }
        function getMyCallStatistic () {
            return http.get(url.statistics.call_today).then(function (res) {
                if (res.status === 'success') {
                    return res.data;
                } else {
                    return []
                }
            })
        }
        function getMyWeeklyStatistic () {
            return http.get(url.statistics.weekly).then(function (res) {
                if (res.status === 'success') {
                    return res.data;
                } else {
                    return []
                }
            })
        }
        function addStatistic(data) {
            return http.post(url.statistics.add, data)
        }
    }
})();