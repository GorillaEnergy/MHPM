;(function () {
    'use strict';

    angular
        .module('service.userService', [])
        .service('userService', userService);

    userService.$inject = ['http', 'url', '$localStorage'];

    function userService(http, url, $localStorage) {

        let model = {};
        model.getConsultantList = getConsultantList;
        model.setConsultantList = setConsultantList;
        model.getKidsList = getKidsList;
        model.getParents = getParents;

        return model;


        function getConsultantList() {
            return http.get(url.consultant.list).then(function (res) {
                return res.status === 'success' ? res.data : [];
            });
        }

        function setConsultantList(user) {
            $localStorage.user = user;
        }

        function getKidsList() {
            return http.get(url.kids.list).then(function (res) {
                return res.status === 'success' ? res.data : [];
            })
        }

        function getParents(data) {
            return http.post(url.parents.list, data);
        }

    }
})();