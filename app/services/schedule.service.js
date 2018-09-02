;(function () {
    'use strict';

    angular
        .module('service.scheduleService', [])
        .service('scheduleService', scheduleService);

    scheduleService.$inject = ['http', 'url', '$sessionStorage'];

    function scheduleService(http, url, $sessionStorage) {
        let model = {};

        model.createSchedule = createSchedule;
        model.updateSchedule = updateSchedule;
        model.deleteSchedule = deleteSchedule;
        model.approveSchedule = approveSchedule;
        model.visibleSchedule = visibleSchedule;
        model.getMySchedule = getMySchedule;
        model.getAllSchedules = getAllSchedules;
        model.getMyScheduleWeeks = getMyScheduleWeeks;

        return model;

        function createSchedule(data) {
            return http.post(url.schedule.create, data)
        }
        function updateSchedule(data) {
            return http.post(url.schedule.update, data)
        }
        function deleteSchedule(data) {
            return http.post(url.schedule.delete, data)
        }
        function approveSchedule(data) {
            return http.post(url.schedule.approve, data)
        }
        function visibleSchedule(data) {
            return http.post(url.schedule.visible, data)
        }
        function getMySchedule() {
            return http.get(url.schedule.getMySchedules)
        }
        function getAllSchedules() {
            return http.get(url.schedule.getSchedules)
        }
        function getMyScheduleWeeks() {
            return http.get(url.schedule.getMySchedulesWeeks)
        }
    }
})();