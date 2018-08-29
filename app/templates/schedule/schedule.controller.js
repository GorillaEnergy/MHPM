;(function () {
    'use strict';
    angular.module('app')
        .controller('ScheduleController', ScheduleController);

    ScheduleController.$inject = ['$localStorage', '$state', 'scheduleService', '$scope', 'uiCalendarConfig'];

    function ScheduleController($localStorage, $state, scheduleService, $scope, uiCalendarConfig) {
        let vm = this;
        console.log('ScheduleController start');

        vm.busyOnWeek = scheduleService.busyOnWeek();
        console.log(vm.busyOnWeek);

        $scope.SelectedEvent = null;
        $scope.events = [];
        $scope.eventSources = [$scope.events];
        $scope.NewEvent = {};

        vm.newEvents = angular.copy($localStorage.events) || [];

        if (!$localStorage.id) {
            $localStorage.id = 1;
        }

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
                    id: value.EventID,
                    start: new Date(value.StartAt),
                    end: new Date(value.EndAt),
                    stick: true
                })
            })
        }
        populate(vm.newEvents);




        vm.prepDate = function () {
            let y = new Date().getFullYear();
            let m = new Date().getMonth();
            let d = new Date().getDate() + 7;
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
                        EventID: $localStorage.id++,
                        StartAt: fromDate,
                        EndAt: endDate,
                    };
                    $scope.saveEvent();
                },

                eventClick: function (event, jsEvent, view) {
                    let fromDate = moment(event.start).format('YYYY-MM-DDTHH:mm:SS');
                    let endDate = moment(event.end).format('YYYY-MM-DDTHH:mm:SS');
                    $scope.NewEvent = {
                        EventID: event.id,
                        StartAt: fromDate,
                        EndAt: endDate,
                    };
                    $scope.ShowAlert(event);
                },
                // eventAfterAllRender: function () {
                //     if ($scope.events.length > 0) {
                //         uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start)
                //     }
                // },
                eventDrop: function (event, delta) {
                    angular.forEach(vm.newEvents, function (el, index) {

                        if (el.EventID === event.id) {
                            let change_event = {
                                EventID: event.id,
                                StartAt: moment(event.start).format('YYYY-MM-DDTHH:mm:SS'),
                                EndAt: moment(event.end).format('YYYY-MM-DDTHH:mm:SS'),
                            };
                            vm.newEvents.splice(index, 1, change_event);
                        }
                    });
                },
                eventResize: function (event) {
                    angular.forEach(vm.newEvents, function (el, index) {
                        if (el.EventID === event.id) {
                            let change_event = {
                                EventID: event.id,
                                StartAt: moment(event.start).format('YYYY-MM-DDTHH:mm:SS'),
                                EndAt: moment(event.end).format('YYYY-MM-DDTHH:mm:SS'),
                            };
                            vm.newEvents.splice(index, 1, change_event);
                        }
                    });
                },
            }
        };

        $scope.saveEvent = function () {
            vm.newEvents.push($scope.NewEvent);
            vm.update();
        };

        $scope.ShowAlert = function (event) {
            vm.event = event;
            vm.showDetailEvent = true;
        };

        vm.deleteEvent = function (id) {
            angular.forEach(vm.newEvents, function (el, index) {
                if (el.EventID === id) {
                    vm.newEvents.splice(index, 1);
                }
            });
            vm.update();
            vm.showDetailEvent = false;
        };

        vm.update = function() {
            $localStorage.events = vm.newEvents;
            populate(vm.newEvents);
        }
    }


})();