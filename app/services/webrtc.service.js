;(function () {
    'use strict';

    angular
        .module('service.webrtcService', [])
        .service('webrtcService', webrtcService);

    webrtcService.$inject = ['http', 'url', '$localStorage' , '$state', '$rootScope', '$mdDialog', '$timeout'];

    function webrtcService(http, url, $localStorage, $state, $rootScope, $mdDialog, $timeout) {
        console.log('webrtcService start');

        let fb = firebase.database();

        let isChannelReady = false;
        let isInitiator = false;
        let isStarted = false;
        let localStream;
        let pc;
        let remoteStream;
        let turnReady;

        let pcConfig = {
            'iceServers': [{
                'urls': 'stun:stun.l.google.com:19302'
            }]
        };

        // Set up audio and video regardless of what devices are present.
        let sdpConstraints = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        };

        /////////////////////////////////////////////

        let model = {};

        model.call = call;

        return model;


        function call(user_id, room_name, creator_id) {
            checkToOnlineUser(user_id, room_name, creator_id);
        }
        function checkToOnlineUser(user_id, room_name, creator_id) {
            // console.time('Timer1');
            fb.ref('/users/' + user_id + '/online').once('value', (snapshot) => {
                // console.timeEnd('Timer1');
                $timeout(function () {
                    console.log(snapshot.val());
                    if (snapshot.val()) {
                        console.log('user online');
                        checkToBusyUser(user_id, room_name, creator_id)
                    } else {
                        console.log('user offline :(');
                    }
                })
            });
        }

        function checkToBusyUser(user_id, room_name, creator_id) {
            fb.ref('/WebRTC/users/' + user_id + '/invite_to_room').once('value', (snapshot) => {
                $timeout(function () {
                    if (snapshot.val() === null || snapshot.val() === 'waiting') {
                        console.log('user not busy, send invitation');
                        sendInvitation(user_id, room_name, creator_id)
                    } else {
                        console.log('user busy');
                    }
                })
            });
        }

        function sendInvitation(user_id, room_name, creator_id) {
            console.log('send invitetion to', user_id);
            fb.ref('/WebRTC/users/' + user_id + '/invite_to_room').set(room_name);
            createRoom(room_name, creator_id);
        }

        function createRoom(room_name, creator_id) {
            let room = {
                number_of_users: 1,
                active: false,
                metadata: {
                    users_id: [creator_id]
                }
            };
            fb.ref('/WebRTC/rooms/' + room_name).set(room);
            // waitingAnswer()
            begin_conference()
        }

        function begin_conference() {
            $rootScope.$emit('begin_video_conference');
        }
    }
})();