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
            'iceServers': [{url: 'stun:stun01.sipphone.com'},
                {url: 'stun:stun.ekiga.net'},
                {url: 'stun:stun.fwdnet.net'},
                {url: 'stun:stun.ideasip.com'},
                {url: 'stun:stun.iptel.org'},
                {url: 'stun:stun.rixtelecom.se'},
                {url: 'stun:stun.schlund.de'},
                {url: 'stun:stun.l.google.com:19302'},
                {url: 'stun:stun1.l.google.com:19302'},
                {url: 'stun:stun2.l.google.com:19302'},
                {url: 'stun:stun3.l.google.com:19302'},
                {url: 'stun:stun4.l.google.com:19302'},
                {url: 'stun:stunserver.org'},
                {url: 'stun:stun.softjoys.com'},
                {url: 'stun:stun.voiparound.com'},
                {url: 'stun:stun.voipbuster.com'},
                {url: 'stun:stun.voipstunt.com'},
                {url: 'stun:stun.voxgratia.org'},
                {url: 'stun:stun.xten.com'},
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
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
            //     requestTurn(
            //         'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
            //     );
            // }
            createPeerConnection();
        }

        function createPeerConnection() {
            try {
                // pc = new RTCPeerConnection(null);
                pc = new RTCPeerConnection(pcConfig);
                pc.onicecandidate = handleIceCandidate;
                pc.onaddstream = handleRemoteStreamAdded;
                pc.onremovestream = handleRemoteStreamRemoved;
                console.log(pc);
                console.log('Created RTCPeerConnnection');
            } catch (e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                alert('Cannot create RTCPeerConnection object.');
                return;
            }
        }

        function handleIceCandidate(event) {
            console.log('icecandidate event: ', event);
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            } else {
                console.log('End of candidates.');
            }
        }

        function handleRemoteStreamAdded(event) {
            console.log('Remote stream added.');
            remoteStream = event.stream;
            remoteVideo.srcObject = remoteStream;
        }

        function handleRemoteStreamRemoved(event) {
            console.log('Remote stream removed. Event: ', event);
        }

        function handleCreateOfferError(event) {
            console.log('createOffer() error: ', event);
        }

        function doCall() {
            console.log('Sending offer to peer');
            pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
        }

        function doAnswer() {
            console.log('Sending answer to peer.');
            pc.createAnswer().then(
                setLocalAndSendMessage,
                onCreateSessionDescriptionError
            );
        }

        function setLocalAndSendMessage(sessionDescription) {
            pc.setLocalDescription(sessionDescription);
            console.log('setLocalAndSendMessage sending message', sessionDescription);
            sendMessage(sessionDescription);
        }

        function onCreateSessionDescriptionError(error) {
            trace('Failed to create session description: ' + error.toString());
        }

        function requestTurn(turnURL) {
            let turnExists = false;
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

        function hangup() {
            console.log('Hanging up.');
            stop();
            sendMessage('bye');
        }

        function handleRemoteHangup() {
            console.log('Session terminated.');
            stop();
            isInitiator = false;
        }

        function stop() {
            isStarted = false;
            pc.close();
            pc = null;
        }

        ////////////////////////////////////////////////////////////////////////////////////
        function callTo(toUser) {
            console.log('call to user', toUser);
            toUser = 2;
            let creator_id = 1;
            let roomName = user_id + '' + new Date()*1;

            // webrtcService.call(toUser, roomName, creator_id);
            beginConference()
        }
        function emulateUserAnswer() {
            console.log('emulateUserAnswer');
        }
    }
})();