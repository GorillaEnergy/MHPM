;(function () {
    'use strict';
    angular.module('app')
        .controller('Call3Controller', Call3Controller);

    Call3Controller.$inject = ['$localStorage', '$state', '$timeout', 'consultants'];

    function Call3Controller($localStorage, $state, $timeout, consultants) {
        let vm = this;

        vm.call = call;
        vm.userOnlineStatus = userOnlineStatus;
        vm.accesToCall = accesToCall;

        let fb = firebase.database();
        let user = $localStorage.user;

        consultants = consultants.filter(function (consultant) {
            if (consultant.id !== user.id) {
                return consultant
            }
        });

        vm.users = consultants;
        vm.userOnlineStatusArr = [true, false];
        watchOnline(vm.users);
        watchInvites();

        function call(to_user) {
            let call_from_user = user.id + 'mhconsultant';
            let call_to_user = to_user.id + 'mhconsultant';

            console.log(call_from_user);
            console.log(call_to_user);

            console.log(to_user.id);
            fb.ref('/WebRTC/users/' + to_user.id + '/invite').set(call_from_user);
            fb.ref('/WebRTC/users/' + to_user.id + '/answer').on('value', (snapshot) => {
                console.log(snapshot.val());
                $timeout(function () {
                    if (snapshot.val()) {
                        dialing('joinRTC', call_from_user, call_to_user)
                    } else {
                        fb.ref('/WebRTC/users/' + to_user.id + '/answer').off();
                    }
                })
            });
        }

        function dialing(type, your_name, opponent_name) {
            //joinRTC  initRTC
            console.log(user);

            document.getElementById('username').value = your_name;
            vm.opponent_name = opponent_name;
            document.getElementById('login_submit').click();

            if (type === 'joinRTC') {
                $timeout(function () {
                    console.log('timeout end');
                    document.getElementById('call_submitt').click();
                }, 1000)
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
            fb.ref('/WebRTC/users/' + user.id + '/invite').on('value', (snapshot) => {
                $timeout(function () {
                    if (snapshot.val()) {
                        if (confirm("Incoming call")) {

                            console.log("pick up");
                            fb.ref('/WebRTC/users/' + user.id + '/answer').set(true);
                            dialing('initRTC', user.id + 'mhconsultant');
                            $timeout(function () {
                                fb.ref('/WebRTC/users/' + user.id + '/invite').remove();
                                fb.ref('/WebRTC/users/' + user.id + '/answer').remove();
                            }, 1500)

                        } else {

                            console.log("hang up");
                            fb.ref('/WebRTC/users/' + user.id + '/answer').set(false);
                            $timeout(function () {
                                fb.ref('/WebRTC/users/' + user.id + '/invite').remove();
                                fb.ref('/WebRTC/users/' + user.id + '/answer').remove();
                            })

                        }
                    }
                })
            });
        }
    }
})();