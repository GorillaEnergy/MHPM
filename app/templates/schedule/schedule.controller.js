;(function () {
    'use strict';
    angular.module('app')
        .controller('ScheduleController', ScheduleController);

    ScheduleController.$inject = ['$localStorage', '$state', 'scheduleService', '$scope', 'uiCalendarConfig', '$mdDialog'];

    function ScheduleController($localStorage, $state, scheduleService, $scope, uiCalendarConfig, $mdDialog) {
        let vm = this;
        console.log('ScheduleController start');

        vm.busyOnWeek = scheduleService.busyOnWeek();
        console.log(vm.busyOnWeek);

        $scope.SelectedEvent = null;
        $scope.events = [];
        $scope.eventSources = [$scope.events];
        $scope.NewEvent = {};


        getSchedules();
        function getSchedules() {
        scheduleService.getMySchedule().then(function (data) {
            vm.newEvents = data.data || [];
            populate(vm.newEvents);
        });
        }

        // if (!$localStorage.id) {
        //     $localStorage.id = 1;
        // }

        // function getDate(datetime) {
        //     if (datetime != null) {
        //         var mili = datetime.replace(/\/Date\((-?\d+)\)\//, '$1');
        //         return new Date(parseInt(mili))
        //     } else {
        //         return "";
        //     }
        // }

        // function clearCalendar() {
        //     if (uiCalendarConfig.calendars.myCalendar != null) {
        //         uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEvents');
        //         uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
        //     }
        // }


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
            let dt = new Date();
            let y = dt.getFullYear();
            let m = dt.getMonth();
            let d = dt.getDate() + 7;
            return new Date(y,m,d);
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
                // eventAfterAllRender: function () {
                //     if ($scope.events.length > 0) {
                //         uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start)
                //     }
                // },
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
                    getSchedules();
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

                var dialogAlert = $mdDialog.alert()
                    .parent(angular.element($('fc-view-container')))
                    .clickOutsideToClose(true)
                    .title(vm.show.date)
                    .textContent(vm.show.time)
                    .ok('Delete')
                    .targetEvent(event);

                $mdDialog.show(dialogAlert).then(function () {
                    let data = {
                        schedule_id: vm.event.id
                    };
                    scheduleService.deleteSchedule(data).then(function (data) {
                        if(data.status = 'success'){
                            getSchedules();
                        }
                    });
                });

        };


        vm.deleteEvent = function (id) {
            angular.forEach(vm.newEvents, function (el, index) {
                if (el.id === id) {
                    vm.newEvents.splice(index, 1);
                }
            });
            vm.update();
            vm.showDetailEvent = false;
        };

        vm.update = function(ev) {
            let data = {
                schedule_id: ev.id,
                time_from: ev.time_from,
                time_to: ev.time_to,
            };
            scheduleService.updateSchedule(data).then(function (data) {
                if(data.status = 'success'){
                    getSchedules();
                }
            });

        }
    }


})();