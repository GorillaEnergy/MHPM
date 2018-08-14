;(function () {
    'use strict';
    angular.module('app')
        .controller('ChatController', ChatController);

    ChatController.$inject = ['$localStorage', '$state', '$timeout'];

    function ChatController($localStorage, $state, $timeout) {
       let vm = this;
       console.log('ChatController start');

       let fb = firebase.database();
       let kid_id = 7;
       let psy_id = 1;
       let number_of_posts = 5;

       // loadMessages();
       function loadMessages() {
           fb.ref('/chats/' + kid_id + '/' + psy_id + '/messages').limitToLast(number_of_posts).once('value', (snapshot) => {
               $timeout(function () {
                   console.log(snapshot.val());
               })
           });
       }

       
       vm.checkFace = checkFace;

        let some = true;
        function checkFace() {
            $('#face-box').remove();

            if (some) {
                some = false;
                $("#picture").attr("src","../../content/1.jpg");
            } else {
                some = true;
                $("#picture").attr("src","../../content/2.jpg");
            }

            $timeout(function () {
                $('#picture').faceDetection({
                    complete: function (faces) {
                        console.log(faces);

                        let $div = $("<div>", {"class": "face-box"});
                        $div.attr('id', 'face-box');
                        $div.css('top', faces[0].positionY);
                        $div.css('left', faces[0].positionX );
                        $div.css('width', faces[0].width );
                        $div.css('height', faces[0].height );
                        $("#wrapper").append($div);
                    }
                });
            }, 1000)
        }

        vm.playPause = playPause;

        $('#video')[0].pause();
        function playPause() {
            if ($('#video')[0].paused) {
                $('#video')[0].play();
                videoFaceChecker();
            } else {
                $('#video')[0].pause();
                vm.stopCheck = true;
            }
        }

        function videoFaceChecker() {
            console.log('videoFaceChecker start');
            let faceCheck = setInterval(() => {
                // console.log('check');
                if (vm.stopCheck) {
                    clearInterval(faceCheck);
                    console.log('videoFaceChecker stop');
                }

                $('#video').faceDetection({
                    complete: function (faces) {
                        console.log(faces);


                        if (faces) {
                            let faceBox = $('#face-box-video');
                            faceBox.css('top', faces[0].positionY);
                            faceBox.css('left', faces[0].positionX );
                            faceBox.css('width', faces[0].width );
                            faceBox.css('height', faces[0].height );
                        }
                    }
                });
            }, 1000);

            // setInterval(function () {
            //
            // }, 1000);
        }


        ////////////////////////////////////////////////

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true, video: { width: 1280, height: 720 } },
                function(stream) {
                    var video = document.querySelector('video');
                    video.srcObject = stream;
                    video.onloadedmetadata = function(e) {
                        // video.play();
                    };
                },
                function(err) {
                    console.log("The following error occurred: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }

    }
})();