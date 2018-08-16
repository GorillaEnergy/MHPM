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


    }
})();