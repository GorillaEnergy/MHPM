;(function () {
    'use strict';

    angular.module('service.RTCService', [])
        .service('RTCService', RTCService);

    RTCService.$inject = ['$localStorage', '$timeout', '$rootScope', '$window', '$mdDialog', 'consultantService', '$state',
        'toastr', 'statisticService', 'firebaseDataSvc', 'utilsSvc', 'modalSvc', 'faceRecognitionService'];

    function RTCService($localStorage, $timeout, $rootScope, $window, $mdDialog, consultantService, $state,
                        toastr, statisticService, firebaseDataSvc, utilsSvc, modalSvc, faceRecognitionService) {
        console.log('RTCService start');

        var video_out;
        var vid_thumb;
        let vidCount = 0;
        let userActivityArr = [];
        let user;
        let localStream;
        let remoteStream;
        let reconnectAccess = true;
        let reconnect;
        let access_to_state_go = true;
        const USER_CHECK_PERIOD = (1 * 1000);
        const TIME_RECONNECT = (30 * 1000);

        const PUB_CONFIG = {
            number: "Anonymous", // listen on username line else Anonymous
            publish_key: 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c', // Your Pub Key
            subscribe_key: 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe', // Your Sub Key
            // subscribe_key : 'sub-c-0d440624-9fdc-11e8-b377-126307b646dc', // Your Sub Key
            // publish_key   : 'pub-c-7ea57229-5447-4f4e-ba45-0baa9734f35e', // Your Pub Key
            ssl: true
        };

        init();

        function init() {
            UserChecker();
        }

        function UserChecker() {
            let checkUserInterval = setInterval(function () {
                if ($localStorage.user) {
                    user = $localStorage.user;
                    onlineChanger(true);
                    watchInvites();
                    watchCancel();
                    clearInterval(checkUserInterval);
                }
            }, USER_CHECK_PERIOD);
        }

        $(window).on('beforeunload', function () {
            if (user) {
                onlineChanger(false);
            }
        });

        function onlineChanger(status) {
            firebaseDataSvc.setOnlineStatus(user.id, status);
        }

        function watchCancel() {
            firebaseDataSvc.onMetadataCancel(user.id, function (snapshot) {
                if (snapshot) {
                    rejectCall();
                    modalSvc.cancel();
                }
            });
        }

        function watchInvites() {
            firebaseDataSvc.watchInvites(user.id, (snapshot) => {
                if (snapshot) {
                    firebaseDataSvc.getUserMetadata(user.id, (snapshot) => {
                        $timeout(function () {
                            let opponent_nick = snapshot.invite_from;
                            let opponent_room = snapshot.invite;
                            let opponent_id = snapshot.number;
                            if (!remoteStream) {
                                incomingCallMsg(opponent_nick, opponent_id, opponent_room);
                            } else {
                                incomingOnBusy(opponent_nick, opponent_id, opponent_room);
                            }
                        });
                    })
                }
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
            }, 1000);
        }

        function reconnectTimerStart() {
            reconnect = true;
            $timeout(function () {
                reconnect = false;
            }, TIME_RECONNECT);

            let timer = setInterval(timerFnc, 1000);

            function timerFnc() {
                console.log(reconnect);
                if (!reconnect) {
                    resetReconnectPermission();
                    clearInterval(timer)
                }
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

        function login(username) {
            access_to_state_go = false;
            localStream = true;
            console.log('login function');
            PUB_CONFIG.number = username || "Anonymous";
            var phone = window.phone = PHONE(PUB_CONFIG);
            phone.debug(function (res) {
                console.log('LOG >>>>>------------------------>>>>>', res);
            });
            var ctrl = window.ctrl = CONTROLLER(phone);
            ctrl.ready(function () {
                ctrl.addLocalStream(vid_thumb);
                addLog("Logged in as " + username);
                faceRecognitionService.init(user.id);
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
                    // index = userActivityArr.findIndex( (v,i) => {
                    //     return v.user == name;
                    // });
                    //fixme refactoring
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
                    let total = utilsSvc.totalTime(data);
                    let send_data = {
                        type: 'call',
                        add_info: {
                            interlocutor_id: Number(data.user.substr(0, name.length - 6)),
                            time: total
                        }
                    };
                    console.log(total);
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
                            kid_id: Number(name.substr(0, name.length - 6)),
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


        function incomingCallMsg(nick, id, room) {
            modalSvc.incomingCall(
                {
                    opponent_name: nick
                }
            ).then(function (res) {
                    if (res.accept === true) {
                        accept(nick, id, room);
                    } else {
                        rejectCall();
                    }
                }
            );

            function accept(nick, id, room) {
                if ($state.current.name !== 'tabs.chat') {
                    $state.go('tabs.chat', {to_call: true});
                    // initDial();
                    // на будущее вызывать initDial только после загрузки контроллера во избежание "критов"
                    $rootScope.$on('dialing', function (event) {
                        initDial();
                    })
                } else {
                    initDial()
                }

                //todo : need to rewrite
                function initDial() {
                    firebaseDataSvc.setAnswer(user.id, true);
                    $timeout(function () {
                        firebaseDataSvc.removeMetadata(user.id);
                    }, 3000);
                    let self_room = user.id + 'mhuser';
                    // dialing(type, your_room, opponent_nick, opponent_room)
                    dialing('initRTC', self_room, nick, room)
                }
            }

        }

        function rejectCall() {
            firebaseDataSvc.setAnswer(user.id, false);
            $timeout(function () {
                firebaseDataSvc.removeMetadata(user.id);
            }, 3000);
        }

        function incomingOnBusy(opponent_name, opponent_id) {
            let data = {
                opponent_name: opponent_name,
                kid_id: opponent_id
            };

            consultantService.list().then(function (res) {
                data.consultants = res.status === 'success' ? res.data : [];
                loadLogs();
            });

            function loadLogs() {
                firebaseDataSvc.getLogs(opponent_id, 10, (snapshot) => {
                    $timeout(function () {
                        data.logs = snapshot ? utilsSvc.objToArr(snapshot).reverse() : [];
                        showDialog(data);
                    });
                });
            }

            function showDialog(data) {
                // console.log(data);
                modalSvc.incomingBusy(data).then(function (res) {
                        if (res.accept === true) {
                            accept(opponent_name, opponent_id, null)
                        } else if (res.accept === 'chat') {
                            chat(opponent_name, opponent_id, null)
                        } else {
                            reject()
                        }
                    }
                );

                function accept(nick, id, room) {
                    // console.log("accept");
                    // console.log(nick, id, room);
                    firebaseDataSvc.setAnswer(user.id, 'add');
                    $timeout(function () {
                        firebaseDataSvc.removeMetadata(user.id);
                    }, 3000);
                }

                function chat(nick, id, room) {
                    // console.log("chat");
                    firebaseDataSvc.setAnswer(user.id, 'chat');
                    $timeout(function () {
                        firebaseDataSvc.removeMetadata(user.id);
                    }, 3000);

                    $rootScope.$broadcast('chat-type', {
                        type: 3,
                        kid_id: id,
                        join: false,
                        users: userActivityArr
                    });
                }

                function reject() {
                    // console.log("reject");
                    firebaseDataSvc.setAnswer(user.id, false);
                    $timeout(function () {
                        firebaseDataSvc.removeMetadata(user.id);
                    }, 3000);
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
            hardEnd();
        }

        function accessToGo() {
            return access_to_state_go;
        }


        let model = {};
        model.incomingCallMsg = incomingCallMsg;
        model.callTo = callTo;
        model.signalLost = signalLost;
        model.closeStream = closeStream;
        model.accessToGo = accessToGo;

        return model;
    }
})();
