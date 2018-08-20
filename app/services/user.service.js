;(function () {
    'use strict';

    angular
        .module('service.userService', [])
        .service('userService', userService);

    userService.$inject = ['http', 'url', '$localStorage', '$state', 'toastr'];

    function userService(http, url, $localStorage, $state, toastr) {

        let model = {};
        model.getConsultantList = getConsultantList;
        model.setConsultantList = setConsultantList;
        model.getKidsList = getKidsList;


        return model;


        function getConsultantList() {
            return http.get(url.consultant.list).then(function (res) {
                if (res.status === 'success') {
                    return res.data;
                } else {
                    return []
                }
            })
        }
        function setConsultantList(user) {
            $localStorage.user = user;
        }
        function getKidsList() {
            return http.get(url.kids.list).then(function (res) {
                if (res.status === 'success') {
                    return res.data;
                } else {
                    return []
                }
            })
        }


    }
})();