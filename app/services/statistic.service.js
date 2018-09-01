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
    }
})();