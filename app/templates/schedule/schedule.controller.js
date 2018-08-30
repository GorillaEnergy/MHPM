;(function () {
    'use strict';
    angular.module('app')
        .controller('ScheduleController', ScheduleController);

    ScheduleController.$inject = ['$localStorage', '$state', 'scheduleService', '$scope', 'uiCalendarConfig', '$mdDialog'];

    function ScheduleController($localStorage, $state, scheduleService, $scope, uiCalendarConfig, $mdDialog) {
        let vm = this;
        console.log('ScheduleController start');

        $scope.SelectedEvent = null;
        $scope.events = [];
        $scope.eventSources = [$scope.events];
        $scope.NewEvent = {};
        let isNextWeek = false;
        let currentWeek;

        init();
        function init() {
            getMySchedules();
            // getAllSchedules()
        }

        vm.nextWeek = function () {
            isNextWeek = true;
            prepareScheduleWeeks();
        };

        function getMySchedules() {
            scheduleService.getMySchedule().then(function (data) {
                vm.newEvents = data.data || [];
                populate(vm.newEvents);
                prepareScheduleWeeks();
            });
        }
        function getAllSchedules() {
            scheduleService.getAllSchedules().then(function (data) {
                vm.newEvents = data.data || [];
                populate(vm.newEvents);
                prepareScheduleWeeks()
            });
        }

        function prepareScheduleWeeks() {
            vm.weeks = [];
            scheduleService.getMyScheduleWeeks().then(function (data) {
                if (data.data.current_week && data.data.next_week){
                    if(data.data.next_week.length !== 0){
                        vm.isShowNext = true;
                    } else{
                        vm.isShowNext = false;
                    }
                    if (isNextWeek){
                        currentWeek = data.data.next_week;
                    } else {
                        currentWeek = data.data.current_week;
                    }
                }

                // let currentWeek = data.data.next_week; // при кліки на след
                angular.forEach(currentWeek, function (el, name) {
                    let day = {time:[], name: name};
                    angular.forEach(el, function (time) {
                        let t = {};
                        t.end = moment(time.time_to).format('HH:mm');
                        t.start = moment(time.time_from).format('HH:mm');
                        day.time.push(t)
                    });
                    vm.weeks.push(day);
                });
                console.log(vm.weeks);
            });
        }

        function populate(data) {
            // clearCalendar();
            $scope.events.splice(0, $scope.events.length);
            angular.forEach(data, function (value) {
                $scope.events.push({
                    id: value.id,
                    start: new Date(value.time_from),
                    end: new Date(value.time_to),
                    stick: true
                })
            })
        }

        vm.prepDate = function () {
            // 2018, 2, 5, 19, 0, 0, 0
            // let dt = new Date();
            // let y = dt.getFullYear();
            // let m = dt.getMonth();
            // let d = dt.getDate();
            // return new Date(y,m,d);
            return moment().add(7, 'days').calendar();
        };

        $scope.uiConfig = {
            calendar: {
                height: '100%',
                editable: true,
                defaultView: 'agendaWeek',
                defaultDate: vm.prepDate(),
                header: {
                    left: '',
                    center: 'title',
                    right: '',
                },
                allDaySlot: false,
                slotDuration: '01:00:00',
                titleFormat: 'MMMM',
                views: {
                    agenda: {
                        minTime: '06:00:00',
                        slotLabelFormat: [
                            'HH:mm',
                        ]
                    },
                },
                timeFormat: 'HH:mm',
                displayEventTime: true,
                selectable: true,
                selectHelper: true,
                select: function (start, end) {
                    let fromDate = moment(start).format('YYYY-MM-DDTHH:mm:SS');
                    let endDate = moment(end).format('YYYY-MM-DDTHH:mm:SS');
                    $scope.NewEvent = {
                        id: 0,
                        time_from: fromDate,
                        time_to: endDate,
                    };
                    $scope.saveEvent();
                },

                eventClick: function (event, jsEvent, view) {
                    let fromDate = moment(event.start).format('YYYY-MM-DDTHH:mm:SS');
                    let endDate = moment(event.end).format('YYYY-MM-DDTHH:mm:SS');
                    $scope.NewEvent = {
                        id: event.id,
                        time_from: fromDate,
                        time_to: endDate,
                    };
                    $scope.ShowAlert(event, jsEvent, view);
                },
                eventDrop: function (event, delta) {
                    angular.forEach(vm.newEvents, function (el, index) {

                        if (el.id === event.id) {
                            let el= {
                                id: event.id,
                                time_from: moment(event.start).format('YYYY-MM-DDTHH:mm:SS'),
                                time_to: moment(event.end).format('YYYY-MM-DDTHH:mm:SS'),
                            };
                            // vm.newEvents.splice(index, 1, change_event);
                            vm.update(el)
                        }
                    });
                },
                eventResize: function (event) {
                    angular.forEach(vm.newEvents, function (el, index) {
                        if (el.id === event.id) {
                            el = {
                                id: event.id,
                                time_from: moment(event.start).format('YYYY-MM-DDTHH:mm:SS'),
                                time_to: moment(event.end).format('YYYY-MM-DDTHH:mm:SS'),
                            };
                            // vm.newEvents.splice(index, 1, change_event);
                            vm.update(el)
                        }
                    });
                },
            }
        };

        $scope.saveEvent = function () {
            let data = {
                time_from: $scope.NewEvent.time_from,
                time_to: $scope.NewEvent.time_to,
            };
            scheduleService.createSchedule(data).then(function (data) {
                if(data.status = 'success'){
                    getMySchedules();
                }
            });
            // vm.newEvents.push($scope.NewEvent);
            // vm.update();
        };

        $scope.ShowAlert = function (event, jsEvent, view) {
            vm.show = {
                date: moment(event.start).format('DD MMM YYYY'),
                time: jsEvent.currentTarget.innerText
            };
            vm.event = event;
            var parentEl = $('.fc-view-container');
            $mdDialog.show({
                parent: parentEl,
                targetEvent: vm.event,
                clickOutsideToClose: true,
                template:
                '<md-dialog>' +
                '  <md-dialog-content>'+
                '    <md-list>'+
                '      <md-list-item>'+
                '           <p>{{date}}</p>' +
                '       </md-list-item>' +
                '      <md-list-item>'+
                '           <p>{{time}}</p>' +
                '       </md-list-item>' +
                '    </md-list>'+
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <md-button ng-click="closeDialog()" class="md-primary">' +
                '      Delete' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',
                locals: {
                    date: vm.show.date,
                    time: vm.show.time
                },
                controller: DialogController
            });
            function DialogController($scope, $mdDialog, date, time) {
                $scope.date = date;
                $scope.time = time;
                $scope.closeDialog = function() {
                    vm.deleteEvent();
                    $mdDialog.hide();
                }
            }

        };

        vm.deleteEvent = function () {
            let data = {
                schedule_id: vm.event.id
            };
            scheduleService.deleteSchedule(data).then(function (data) {
                if (data.status = 'success') {
                    getMySchedules();
                }
            });
        };

        vm.update = function(ev) {
            let data = {
                schedule_id: ev.id,
                time_from: ev.time_from,
                time_to: ev.time_to,
            };
            scheduleService.updateSchedule(data).then(function (data) {
                if(data.status = 'success'){
                    getMySchedules();
                }
            });
        };

        vm.send  = function () {
            let schedule_ids = [];
            angular.forEach(vm.newEvents, function (el) {
                schedule_ids.push(el.id);
            });

            let data = {
                schedule_id: schedule_ids
            };

            scheduleService.visibleSchedule(data);
        };

        vm.approve  = function () {
            let schedule_ids = [];
            angular.forEach(vm.newEvents, function (el) {
                schedule_ids.push(el.id);
            });
            let data = {
                schedule_id: schedule_ids
            };
            scheduleService.approveSchedule(data).then(function (data) {
                if(data.status = 'success'){
                    prepareScheduleWeeks();
                }
            });
        }
    }


})();