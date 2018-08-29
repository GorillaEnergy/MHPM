;(function () {
    'use strict';

    angular
        .module('service.dateConverter', [])
        .service('dateConverter', dateConverter);

    dateConverter.$inject = [];

    function dateConverter() {
        let model = {};

        model.dateConverter = dateConverter;
        model.timeConverter = timeConverter;

        return model;

        function dateConverter(timestamp) {

            if (date() === date(timestamp)) { return 'Today' } else { return date(timestamp) }

            function date(timestamp) {
                let date;
                if (timestamp) { date = new Date(timestamp) } else { date = new Date(); }

                let day = date.getDate();
                let month = Number(date.getMonth()) + 1;
                let year = date.getFullYear();

                if (day < 10) { day = '0' + day }
                if (month < 10) { month = '0' + month }

                return day + '.' + month + '.' + year;

            }
        }

        function timeConverter(timestamp) {
            let hours = new Date(timestamp).getHours();
            let minutes = new Date(timestamp).getMinutes();
            if (hours < 10) {
                hours = '0' + String(hours);
            }
            if (minutes < 10) {
                minutes = '0' + String(minutes);
            }

            return hours + ':' + minutes;
        }
    }
})();