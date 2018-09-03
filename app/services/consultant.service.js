;(function () {
    'use strict';

    angular
        .module('service.consultantService', [])
        .service('consultantService', consultantService);

    consultantService.$inject = ['http', 'url', '$localStorage', '$state', 'toastr'];

    function consultantService(http, url, $localStorage, $state, toastr) {




        let model = {};

        model.list = list;
        model.convert = convert;


        return model;


        function list() {
            return http.get(url.consultant.list);
        }
        function convert(consultants) {
            let data = {};
            angular.forEach(consultants, function (consultant) {
                data[consultant.id] = consultant;
            });
            console.log(data);
            return data;
        }
    }
})();