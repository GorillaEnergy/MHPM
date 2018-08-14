;(function () {
    'use strict';
    angular.module('app')
        .controller('CallController', CallController);

    CallController.$inject = ['$localStorage', '$state', '$timeout'];

    function CallController($localStorage, $state, $timeout) {
       let vm = this;
       console.log('ChatController start');


        vm.playPause = playPause;
        vm.getVideoInfo = getVideoInfo;
        vm.stop = stop;
        vm.call = call;


        let localVideo = $('#localVideo')[0];
        let remoteVideo1 = $('#remoteVideo1')[0];
        let remoteVideo2 = $('#remoteVideo2')[0];
        let remoteVideo3 = $('#remoteVideo3')[0];
        console.dir(localVideo);

        initialize();


        function initialize() {
            initWebRTC();
        }

        function initWebRTC() {
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;

            if (navigator.getUserMedia) {
                navigator.getUserMedia({ audio: true, video: { width: 640, height: 480 } },
                    function(stream) {
                        localVideo.srcObject = stream;
                        vm.streamURL = stream.id;
                        localVideo.onloadedmetadata = function(e) {
                            // localVideo.play();
                        };
                    },
                    function(err) {
                        console.log("The following error occurred: " + err.name);
                    }
                );
            } else {
                alert("getUserMedia not supported");
                console.log("getUserMedia not supported");
            }
        }

        function playPause() {
            localVideo.paused ? localVideo.play() : localVideo.pause() ;
        }

        function getVideoInfo() {
            console.dir(localVideo.srcObject);
        }
        function stop() {
            console.log('stop');
        }
        function call() {
            console.log('call');
        }



    }
})();