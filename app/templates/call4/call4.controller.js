;(function () {
    'use strict';
    angular.module('app')
        .controller('Call4Controller', Call4Controller);

    Call4Controller.$inject = ['$localStorage', '$state', '$timeout', 'consultants', 'kids', 'userService', '$mdDialog'];

    function Call4Controller($localStorage, $state, $timeout, consultants, kids, userService, $mdDialog) {
        console.log('Call4Controller start');
        let vm = this;

        let localStream;
        let remoteStream;
        let channelName;
        let reconnectAccess = true;
        let reconnect;

        vm.call = call;
        vm.userOnlineStatus = userOnlineStatus;
        vm.accesToCall = accesToCall;

        vm.end = end;
        vm.mute = mute;
        vm.pause = pause;

        let fb = firebase.database();
        let user = $localStorage.user;

        //////////////// Users list and online status////////////////
        vm.users = usersFilter(kids, consultants);
        vm.userOnlineStatusArr = [];
        watchOnline(vm.users);
        watchInvites();

        function usersFilter(kids, consultants) {
            consultants = consultants.filter(function (consultant) {
                if (consultant.id !== user.id) {
                    return consultant
                }
            });
            return kids.concat(consultants)
        }
        /////////////////////////////////////////////////////////////

        // incommingOnBusy('room', 'name');
        function incommingOnBusy(room_name, opponent_name) {
            $mdDialog.show({
                controller: 'IncomingOnBusyController',
                controllerAs: 'vm',
                templateUrl: 'components/incoming-on-busy/incoming-on-busy.html',
                clickOutsideToClose: false,
                locals: {
                    opponent_name: opponent_name
                }
            }).then(function (res) {
                //new add undefined
                console.log(res);
                if (res === 'add') {
                    addToCurrentChat(room_name, opponent_name);
                } else {
                    console.log("hang up");
                    fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set(false);
                    $timeout(function () {
                        fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                    }, 100)
                }
            }, function () {

            });
        }

        function addToCurrentChat(room_name, opponent_name) {
            console.log('addToCurrentChat');
            fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set('add');
            $timeout(function () {
                fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
            }, 1500)
        }

        //////////////// Signaling ////////////////
        function call(to_user) {
            let call_from_user = user.id + 'mhuser';
            let call_to_user = to_user.id + 'mhuser';

            console.log('звонит: ' + call_from_user + ',пользователю: ' + call_to_user);

            fb.ref('/WebRTC/users/' + to_user.id + '/metadata/invite').set(call_from_user);
            fb.ref('/WebRTC/users/' + to_user.id + '/metadata/invite_from').set(user.name);
            fb.ref('/WebRTC/users/' + to_user.id + '/metadata/answer').on('value', (snapshot) => {
                // console.log(snapshot.val());
                $timeout(function () {
                    console.log('answer', snapshot.val());
                    if (snapshot.val() === true) {
                        offAnswerWatcher(to_user.id);
                        dialing('joinRTC', call_from_user, call_to_user)
                    } else if (snapshot.val() === false) {
                        offAnswerWatcher(to_user.id);
                    } else if (snapshot.val() === 'add') {
                        offAnswerWatcher(to_user.id);
                        console.log(vidCount);
                        console.log(remoteStream);
                        if (vidCount || remoteStream) {
                            end();
                            dialing('initRTC', call_from_user, call_to_user)
                        } else {
                            dialing('joinRTC', call_from_user, call_to_user)
                        }
                    }
                })
            });
        }
        function offAnswerWatcher(id) {
            fb.ref('/WebRTC/users/' + id + '/metadata/answer').off();
        }

        function dialing(type, your_name, opponent_name) {
            //joinRTC  initRTC
            console.log(user);
            console.log(type, your_name, opponent_name);

            if (!localStream) {
                console.log('login');
                errWrap(login, your_name);
            }

            if (type === 'joinRTC') {
                $timeout(function () {
                    console.log('makeCall');
                    errWrap(makeCall, opponent_name);
                }, 3000)
            }
        }

        function userOnlineStatus(index) {
            if (vm.userOnlineStatusArr[index]) {
                return 'online-status'
            }
        }

        function accesToCall(index) {
            if (vm.userOnlineStatusArr[index]) {
                return true;
            } else {
                return false;
            }
        }

        function watchOnline(users) {
            angular.forEach(users, function (user, key) {
                fb.ref('/WebRTC/users/' + user.id + '/online').on('value', (snapshot) => {
                    $timeout(function () {
                        if (snapshot.val()) {
                            vm.userOnlineStatusArr[key] = true;
                        } else {
                            vm.userOnlineStatusArr[key] = false;
                        }
                    })
                });
            });
        }

        function watchInvites() {
            fb.ref('/WebRTC/users/' + user.id + '/metadata/invite').on('value', (snapshot) => {
                $timeout(function () {
                    if (snapshot.val()) {
                        let room_name = snapshot.val();

                        fb.ref('/WebRTC/users/' + user.id + '/metadata/invite_from').once('value', (snapshot) => {
                            let opponent_name = snapshot.val();
                            if (vidCount) {
                                incommingOnBusy(room_name, opponent_name)
                            } else {
                                if (confirm("Incoming call from " + opponent_name)) {

                                    console.log("pick up");
                                    fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set(true);
                                    console.log(user.id);
                                    dialing('initRTC', user.id + 'mhuser');
                                    $timeout(function () {
                                        fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                                    }, 1500)

                                } else {

                                    console.log("hang up");
                                    fb.ref('/WebRTC/users/' + user.id + '/metadata/answer').set(false);
                                    $timeout(function () {
                                        fb.ref('/WebRTC/users/' + user.id + '/metadata').remove();
                                    }, 100)
                                }
                            }
                        });



                    }
                })
            });
        }


        //////////////// Init RTC ////////////////

        let video_out = document.getElementById("vid-box");
        let vid_thumb = document.getElementById("vid-thumb");
        let vidCount  = 0;
        let userActivityArr = [];

        function login(username) {
            let phone = window.phone = PHONE({
                number        : username || "Anonymous", // listen on username line else Anonymous
                publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c', // Your Pub Key
                subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe', // Your Sub Key
                // publish_key   : 'pub-c-7ea57229-5447-4f4e-ba45-0baa9734f35e', // Your Pub Key
                // subscribe_key : 'sub-c-0d440624-9fdc-11e8-b377-126307b646dc', // Your Sub Key
                ssl: true
            });
            let ctrl = window.ctrl = CONTROLLER(phone);

            ctrl.ready(function(){
                ctrl.addLocalStream(vid_thumb);
                addLog("Logged in as " + username);
                localStream = true;
                channelName = username;
            });

            ctrl.receive(function(session){
                // session.connected(function(session){ video_out.appendChild(session.video); addLog(session.number + " has joined."); vidCount++; });
                // session.ended(function(session) { ctrl.getVideoElement(session.number).remove(); addLog(session.number + " has left.");    vidCount--;});
                session.connected(function(session){
                    video_out.appendChild(session.video);
                    addLog(session.number + " has joined.");
                    activityCalc(session.number, true);
                });

                session.ended(function(session) {
                    ctrl.getVideoElement(session.number).remove();
                    addLog(session.number + " has left.");
                    activityCalc(session.number, false);
                });
            });

            ctrl.videoToggled(function(session, isEnabled){
                ctrl.getVideoElement(session.number).toggle(isEnabled);
                addLog(session.number+": video enabled - " + isEnabled);
            });

            ctrl.audioToggled(function(session, isEnabled){
                ctrl.getVideoElement(session.number).css("opacity",isEnabled ? 1 : 0.75);
                addLog(session.number+": audio enabled - " + isEnabled);
            });

            function activityCalc(name, join) {
                console.log(name, join);
                let index;

                search(name);
                function search(name) {
                    for (let i=0; i < userActivityArr.length; i++) {
                        if (userActivityArr[i].name == name) {
                            index = i;
                            console.log('index = ' + i);
                            break
                        }
                    }
                    change(name);
                }
                function change(name) {
                    if (join) {
                        userActivityArr.push({ user: name })
                    } else {
                        userActivityArr.splice(index, 1)
                    }

                    vidCalc(name)
                }
                function vidCalc(name) {
                    vidCount = userActivityArr.length;

                    console.log('User arr', userActivityArr);
                    console.log('User count', vidCount);
                    if (!vidCount) {
                        remoteStream = false;
                        channelName = null;
                    } else {
                        remoteStream = name;
                    }
                }
            }
            return false;
        }

        function makeCall(opponent_name){
            if (!window.phone) alert("Login First!");
            let num = opponent_name;
            if (phone.number()==num) return false; // No calling yourself!
            ctrl.isOnline(num, function(isOn){
                if (isOn) {
                    ctrl.dial(num);
                    reconnect = false;
                } else {
                    if (reconnectAccess) {
                        $timeout(function () {
                            makeCall(opponent_name);
                        }, 1000);

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

        function mute(){
            let audio = ctrl.toggleAudio();
            if (!audio) $("#mute").html("Unmute");
            else $("#mute").html("Mute");
        }

        function end(){
            ctrl.hangup();
        }

        function pause(){
            let video = ctrl.toggleVideo();
            if (!video) $('#pause').html('Unpause');
            else $('#pause').html('Pause');
        }

        function getVideo(number){
            return $('*[data-number="'+number+'"]');
        }

        function addLog(log){
            // $('#logs').append("<p>"+log+"</p>");
            console.log(log);
        }

        function errWrap(fxn, form){
            try {
                return fxn(form);
            } catch(err) {
                alert(err);
                return false;
            }
        }


        function reconnectTimerStart() {
            reconnect = true;
            $timeout(function () { reconnect = false; }, 30000);

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
            $timeout(function () { reconnectAccess = true; }, 5000);

        }


        //////////////// Script isogram ////////////////

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new
        Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-46933211-3', 'auto');
        ga('send', 'pageview');

        //////////////// testiki ////////////////


    }
})();