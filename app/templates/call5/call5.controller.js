;(function () {
    'use strict';
    angular.module('app')
        .controller('Call5Controller', Call5Controller);

    Call5Controller.$inject = ['$localStorage', '$state', '$timeout', '$rootScope', 'webrtcService'];

    function Call5Controller($localStorage, $state, $timeout, $rootScope, webrtcService) {
        let vm = this;
        console.log('Call5Controller start');

        vm.callTo = callTo;
        vm.emulateUserAnswer = emulateUserAnswer;


        let fb = firebase.database();
        let user_id  = 1;

        let localVideo = document.querySelector('#localVideo');
        let remoteVideo = document.querySelector('#remoteVideo');
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


        $rootScope.$on('begin_video_conference', function (event, data) {
            beginConference()
        });

        $rootScope.$on('join_to_video_conference', function (event, room) {
            console.log('Another peer made a request to join room ' + room);
            console.log('This peer is the initiator of room ' + room + '!');
            isChannelReady = true;
        });

        $rootScope.$on('joined_to_video_conference', function (event, room) {
            console.log('joined: ' + room);
            isChannelReady = true;
        });

        let constraints = {
            audio: true,
            video: true
        };

        function beginConference() {
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true
            })
                .then(gotStream)
                .catch(function(e) {
                    alert('getUserMedia() error: ' + e.name);
                });

            function gotStream(stream) {
                console.log('Adding local stream.');
                localStream = stream;
                localVideo.srcObject = stream;
            }

            // if (location.hostname !== 'localhost') {
                requestTurn(
                    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
                );
            // }
        }

        function requestTurn(turnURL) {
            let turnExists = false;
            console.log(pcConfig);
            for (let i in pcConfig.iceServers) {
                if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
                    turnExists = true;
                    turnReady = true;
                    break;
                }
            }
            if (!turnExists) {
                console.log('Getting TURN server from ', turnURL);
                // No TURN server. Get one from computeengineondemand.appspot.com:
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        let turnServer = JSON.parse(xhr.responseText);
                        console.log('Got TURN server: ', turnServer);
                        pcConfig.iceServers.push({
                            'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
                            'credential': turnServer.password
                        });
                        turnReady = true;
                    }
                };
                xhr.open('GET', turnURL, true);
                xhr.send();
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////
        function callTo(toUser) {
            console.log('call to user', toUser);
            toUser = 2;
            let creator_id = 1;
            let roomName = user_id + '' + new Date()*1;

            webrtcService.call(toUser, roomName, creator_id);
        }
        function emulateUserAnswer() {
            console.log('emulateUserAnswer');
        }
    }
})();