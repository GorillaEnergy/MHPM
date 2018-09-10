;(function () {
    'use strict';

    angular
        .module('service.kidService', [])
        .service('kidService', kidService);

    kidService.$inject = ['http', 'url', '$localStorage', '$state', 'toastr'];

    function kidService(http, url, $localStorage, $state, toastr) {

        let model = {};

        model.convert = convert;

        return model;


        function convert(kids) {
            let data = {};
            angular.forEach(kids, function (kid) {
                data[kid.id] = kid;
            });
            console.log(data);
            return data;
        }
    }
})();