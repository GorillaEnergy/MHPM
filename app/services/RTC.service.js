;(function () {
    'use strict';

    angular.module('service.RTCService', [])
        .service('RTCService', RTCService);

    RTCService.$inject = ['$localStorage', '$timeout', '$rootScope', '$window', '$mdDialog', 'consultantService', '$state',
                          'toastr', 'statisticService'];

    function RTCService($localStorage, $timeout, $rootScope, $window, $mdDialog, consultantService, $state,
                        toastr, statisticService) {
        console.log('RTCService start');

        let user;
        let localStream;
        let remoteStream;
        let channelName;
        let reconnectAccess = true;
        let reconnect;
        let popup;
        let access_to_state_go = true;

        UserChecker();

        function UserChecker() {
            let userTimer = setInterval(timer, 1000);

            function timer() {
                if ($localStorage.user) {
                    user = $localStorage.user;
                    onlineChanger(true);
                    initFB();
                    myStopFunction()
                }
            }

            function myStopFunction() {
                clearInterval(userTimer);
            }
        }

        $(window).on('beforeunload', function () {
            if (user) {
                onlineChanger(false);
            }
        });

        function onlineChanger(status) {
            if (!status) {
                console.log('offline!');
                firebase.database().ref('/WebRTC/users/' + user.id + '/online').set(status);
            } else {
                $timeout(function () {
                    console.log('online!');
                    firebase.database().ref('/WebRTC/users/' + user.id + '/online').set(status);
                })
            }
        }


        function initFB() {
            watchInvites()
        }

        function watchInvites() {
            let fb = firebase.database();
            fb.ref('/WebRTC/users/' + user.id + '/metadata/invite').on('value', (snapshot) => {
                $timeout(function () {
                    if (snapshot.val()) {

                        fb.ref('/WebRTC/users/' + user.id + '/metadata').once('value', (snapshot) => {
                            $timeout(function () {
                                let opponent_nick = snapshot.val().invite_from;
                                let opponent_room = snapshot.val().invite;
                                let opponent_id = snapshot.val().number;

                                if (!remoteStream) {
                                    incomingCallMsg(opponent_nick, opponent_id, opponent_room);

                                } else {
                                    incomingOnBusy(opponent_nick, opponent_id, opponent_room);
                                }
                            });
                        })

                    }
                })
            });
        }

        function dialing(type, your_name, opponent_nick, opponent_name) {
            //initRTC || joinRTC, your_room, opponent_nick, opponent_room
            // console.log(user);

            $timeout(function () {
                video_out = document.getElementById("vid-box");   //remote stream
                vid_thumb = document.getElementById("vid-thumb"); // local stream

                // console.log(your_name, opponent_nick, opponent_name);

                if (!localStream) {
                    errWrap(login, your_name);
                }

                // if (type === 'joinRTC') {
                //     $timeout(function () {
                //         // console.log('makeCall to ', opponent_nick);
                //         errWrap(makeCall, opponent_nick);
                //     }, 3000)
                // }

            }, 1000);

        }


        function reconnectTimerStart() {
            reconnect = true;
            $timeout(function () {
                reconnect = false;
            }, 30000);

            let timer = setInterval(timerFnc, 1000);

            function timerFnc() {
                console.log(reconnect);
                if (!reconnect) {
                    stopTimer()
                }
            }

            function stopTimer() {
                resetReconnectPermission();
                clearInterval(timer)
            }
        }

        function resetReconnectPermission() {
            console.log('resetReconnectPermission');
            reconnectAccess = false;
            $timeout(function () {
                reconnectAccess = true;
            }, 5000);

        }

        // ///////////////////////////////////////////////////////////////////////////////////////////

        var video_out;
        var vid_thumb;
        let vidCount = 0;
        let userActivityArr = [];

        function login(username) {
            access_to_state_go = false;
            localStream = true;
            console.log('login function');
            var phone = window.phone = PHONE({
                number: username || "Anonymous", // listen on username line else Anonymous
                publish_key: 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c', // Your Pub Key
                subscribe_key: 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe', // Your Sub Key
                // subscribe_key : 'sub-c-0d440624-9fdc-11e8-b377-126307b646dc', // Your Sub Key
                // publish_key   : 'pub-c-7ea57229-5447-4f4e-ba45-0baa9734f35e', // Your Pub Key
                ssl: true
            });

            var ctrl = window.ctrl = CONTROLLER(phone);

            ctrl.ready(function () {
                ctrl.addLocalStream(vid_thumb);
                addLog("Logged in as " + username);
            });

            ctrl.receive(function (session) {

                session.connected(function (session) {
                    video_out = document.getElementById("vid-box");   //remote stream
                    activityCalc(session.number, true);
                    video_out.appendChild(session.video);
                    addLog(session.number + " has joined.");
                });

                session.ended(function (session) {
                    activityCalc(session.number, false);
                    // ctrl.getVideoElement(session.number).remove();
                    ctrl.getVideoWrap(session.number).remove();
                    addLog(session.number + " has left.");
                });
            });

            ctrl.videoToggled(function (session, isEnabled) {
                ctrl.getVideoElement(session.number).toggle(isEnabled);
                addLog(session.number + ": video enabled - " + isEnabled);
            });

            ctrl.audioToggled(function (session, isEnabled) {
                ctrl.getVideoElement(session.number).css("opacity", isEnabled ? 1 : 0.75);
                addLog(session.number + ": audio enabled - " + isEnabled);
            });

            function activityCalc(name, join) {
                let index;

                search(name, join);
                function search(name, join) {
                    for (let i = 0; i < userActivityArr.length; i++) {
                        if (userActivityArr[i].user == name) {
                            index = i;
                            break;
                        }
                    }
                    change(name, join);
                }

                function change(name, join) {
                    if (join) {
                        userActivityArr.push({user: name, start_time: new Date()})
                    } else {
                        setCallLength(userActivityArr[index]);
                        userActivityArr.splice(index, 1);
                    }

                    vidCalc(name, join)
                }

                function setCallLength(data) {
                    let start, end, total_second, total_minutes, total_hours, total, id, send_data;
                    id = Number(data.user.substr(0 , name.length - 6));

                    start = data.start_time;
                    end = new Date();
                    total_second = Math.floor((end - start) / 1000);
                    total_minutes = Math.floor(total_second / 60);
                    total_hours = Math.floor(total_minutes / 60);
                    total_minutes =  total_minutes - total_hours * 60;

                    if (total_minutes < 10) { total_minutes = '0' + total_minutes}
                    if (total_hours < 10) { total_hours = '0' + total_hours}

                    total = total_hours + ':' + total_minutes;
                    console.log(total);

                    send_data = {
                        type: "call",
                        add_info: {
                            interlocutor_id: id,
                            time: total
                        }
                    };

                    if (total !== '00:00') {
                        console.log('send statistic');
                        statisticService.addStatistic(send_data)
                    }

                }

                function vidCalc(name, join) {
                    vidCount = userActivityArr.length;
                    $localStorage.userActivityArr = userActivityArr;

                    if (!vidCount) {
                        if (remoteStream) {
                            hardEnd();
                        }
                    } else {
                        remoteStream = name;

                        let data = {
                            type: null,
                            kid_id: Number(name.substr(0 , name.length - 6)),
                            join: join,
                            users: userActivityArr
                        };

                        if (vidCount === 1) {
                            data.type = 2;
                            $rootScope.$broadcast('chat-type', data)
                        } else if (vidCount > 1) {
                            data.type = 4;
                            $rootScope.$broadcast('chat-type', data)
                        }
                    }
                }
            }

            return false;
        }

        function makeCall(opponent_nick) {
            // console.log('makeCall function', 'call to ', opponent_nick);
            if (!window.phone) alert("Login First!");
            var num = opponent_nick;
            if (phone.number() == num) return false; // No calling yourself!
            ctrl.isOnline(num, function (isOn) {
                if (isOn) {
                    ctrl.dial(num);
                    reconnect = false;
                } else {
                    if (reconnectAccess) {
                        $timeout(function () {
                            makeCall(opponent_nick);
                        }, 2000);

                        if (!reconnect) {
                            reconnectTimerStart();
                        }
                    } else {
                        reconnect = false;
                        alert("User if Offline");
                    }
                }

            });
            return false;
        }

        function mute() {
            var audio = ctrl.toggleAudio();
            if (!audio) $("#mute").html("Unmute");
            else $("#mute").html("Mute");
        }

        function end() {
            ctrl.hangup();
        }
        function hardEnd() {
            end();
            $timeout(function () {
                $window.location.reload();
            }, 1000);
        }

        function pause() {
            var video = ctrl.toggleVideo();
            if (!video) $('#pause').html('Unpause');
            else $('#pause').html('Pause');
        }

        function addLog(log) {
            // $('#logs').append("<p>"+log+"</p>");
            console.log(log);
        }

        function errWrap(fxn, form) {
            try {
                return fxn(form);
            } catch (err) {
                alert(err);
                return false;
            }
        }

        //////////////// Script isogram ////////////////

        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new
            Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

        ga('create', 'UA-46933211-3', 'auto');
        ga('send', 'pageview');

        $timeout(function () {
            console.clear()
        }, 4000)
        /////////////////////////////////////////////////
        let model = {};

        model.incomingCallMsg = incomingCallMsg;
        model.callTo = callTo;
        model.signalLost = signalLost;
        model.closeStream = closeStream;
        model.accessToGo = accessToGo;

        return model;


        function incomingCallMsg(nick, id, room) {
            let fb = firebase.database();

            let data = {
                opponent_name: nick
            };

            $mdDialog.show({
                controller: 'IncomingCallController',
                controllerAs: 'vm',
                locals: {
                    data: data
                },
                templateUrl: 'components/incoming-call/incoming-call.html',
                clickOutsideToClose: false,
            }).then(function (res) {
                    if (res.accept === true) {
                        accept(nick, id, room)
                    } else {
                        reject(nick, id, room)
                    }
                },
                function () {}
            );

            function accept(nick, id, room) {
                // console.log("accept");
                // console.log(nick, id, room);

                if ($state.current.name !== 'tabs.chat') {
                    // console.log('to chat');
                    $state.go('tabs.chat', {to_call: true});
                    // initDial();
                    // на будущее вызывать initDial только после загрузки контроллера во избежание "критов"
                    $rootScope.$on('dialing', function (event) {
                        initDial();
                    })
                } else {
                    initDial()
                }

                function initDial() {
                    fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set(true);
                    $timeout(function () {
                        fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                    }, 100);

                    let self_room = user.id + 'mhuser';
                    // dialing(type, your_room, opponent_nick, opponent_room)
                    dialing('initRTC', self_room, nick, room)
                }

            }
            function reject() {
                // console.log("reject");
                let fb = firebase.database();
                fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set(false);
                $timeout(function () {
                    fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                }, 100)

            }

        }

        function incomingOnBusy(opponent_name, opponent_id) {
            let fb = firebase.database();

            let data = {
                opponent_name: opponent_name,
                kid_id: opponent_id
            };

            consultantService.list().then(function (res) {
                if (res.status === 'success') {
                    data.consultants = res.data;
                    loadLogs()
                } else {
                    data.consultants = [];
                    loadLogs()
                }
            });

            function loadLogs() {
                fb.ref('/logs/' + opponent_id).limitToLast(10).once('value', (snapshot) => {
                    $timeout(function () {
                        // console.log(angular.copy(snapshot.val()));
                        snapshot.val() ? data.logs = convertToArray(snapshot.val()) : data.logs = [];
                        showDialog(data);
                    })
                });
            }

            function convertToArray(data) {
                let res = [];
                let arrOfKeys = Object.keys(data);
                angular.forEach(arrOfKeys ,function (key) {
                    res.push(data[key]);
                });

                return res.reverse();
            }

            function showDialog(data) {
                // console.log(data);
                $mdDialog.show({
                    controller: 'IncomingOnBusyController',
                    controllerAs: 'vm',
                    locals: {
                        data: data
                    },
                    templateUrl: 'components/incoming-on-busy/incoming-on-busy.html',
                    clickOutsideToClose: false,
                }).then(function (res) {
                        if (res.accept === true) {
                            accept(opponent_name, opponent_id, null)
                        } else if (res.accept === 'chat') {
                            chat(opponent_name, opponent_id, null)
                        } else {
                            reject()
                        }
                    },
                    function () {}
                );

                function accept(nick, id, room) {
                    // console.log("accept");
                    // console.log(nick, id, room);

                    fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set('add');
                    $timeout(function () {
                        fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                    }, 100);

                    let self_room = user.id + 'mhuser';

                    // toastr.info('Under development')

                }
                function chat(nick, id, room) {
                    // console.log("chat");
                    fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set('chat');
                    $timeout(function () {
                        fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                    }, 100);

                    let data = {
                        type: 3,
                        kid_id: id,
                        join: false,
                        users: userActivityArr
                    };
                    $rootScope.$broadcast('chat-type', data)

                }
                function reject() {
                    // console.log("reject");
                    fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set(false);
                    $timeout(function () {
                        fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                    }, 100);


                }
            }
        }

        function callTo(opponent) {
            console.log(opponent);
        }


        ////////////////////////////////////////////////////////
        function signalLost() {
            console.log('signalLost');
        }

        function closeStream() {
            hardEnd()
        }

        function accessToGo() {
            return access_to_state_go;
        }

    }
})();
