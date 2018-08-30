;(function () {
    'use strict';

    angular
        .module('service.consultantService', [])
        .service('consultantService', consultantService);

    consultantService.$inject = ['http', 'url', '$localStorage', '$state', 'toastr'];

    function consultantService(http, url, $localStorage, $state, toastr) {

        let model = {};
        model.convert = convert;


        return model;

        function convert(consultants) {
            console.log(consultants);
            let data = {};
            angular.forEach(consultants, function (consultant) {
                data[consultant.id] = consultant;
            });
            return data;
        }
    }
})();