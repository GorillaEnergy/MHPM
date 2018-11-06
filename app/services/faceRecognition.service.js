;(function () {
    'use strict';

    angular.module('service.faceRecognition', [])
        .service('faceRecognitionService', faceRecognitionService);

    faceRecognitionService.$inject = ['$timeout', 'firebaseDataSvc'];

    function faceRecognitionService($timeout, firebaseDataSvc) {

        // 996541237
        let webcam = null;     // our webcam video
        let imageData = null;  // image data for BRFv4
        let imageDataSizes = null;
        let currentPsyId;
        let initScale = null; // Block width * aspect ratio * custom scale / mask height

        let imageDataCtx = null;                                   // only fetch the context once
        let brfv4 = null; // the library namespace
        let brfManager = null; // the API
        let resolution = null; // the video stream resolution (usually 640x480)
        let timeoutId = -1;
        let isWebAssemblySupported = null;
        let isIOS = null;
        let brfv4BaseURL = null;
        let brfv4SDKName = null; // the currently available library
        let brfv4WASMBuffer = null;


        function onMaskEvent(psyId) {
            let count = 0;
            firebaseDataSvc.onMask(psyId, function (maskObj) {
                count++;
            });
            setInterval(function () {
                console.log('COUNT OF MASK EVENT:', count);
                count = 0;
            }, 1000);
        }

        function offMaskEvent(psyId) {
            firebaseDataSvc.offMask(psyId);
        }


        // Even for a minimal examplionic e there are several functions that are commonly used by all minimal examples, eg. adding
        // the correct script (wasm or asm.js), starting the webcam etc.

        // Once we know whether wasm is supported we add the correct library script and initialize the example.

        function _isWebAssemblySupported() {
            let isWebAssemblySupported = (typeof WebAssembly === 'object');
            if (isWebAssemblySupported && !testSafariWebAssemblyBug()) {
                isWebAssemblySupported = false;
            }
            return isWebAssemblySupported;
        }

        function testSafariWebAssemblyBug() {

            let bin = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127, 3, 2, 1, 0, 5, 3, 1, 0, 1, 7, 8, 1, 4, 116, 101, 115, 116, 0, 0, 10, 16, 1, 14, 0, 32, 0, 65, 1, 54, 2, 0, 32, 0, 40, 2, 0, 11]);
            let mod = new WebAssembly.Module(bin);
            let inst = new WebAssembly.Instance(mod, {});
            // test storing to and loading from a non-zero location via a parameter.
            // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations
            return (inst.exports.test(4) !== 0);
        }

        function readWASMBinary(url, onload, onerror, onprogress) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function xhr_onload() {
                if (xhr.status === 200 || xhr.status === 0 && xhr.response) {
                    onload(xhr.response);
                    return;
                }
                onerror()
            };
            xhr.onerror = onerror;
            xhr.onprogress = onprogress;
            xhr.send(null);
        }

        function addBRFScript() {
            let script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("async", true);
            script.setAttribute("src", brfv4BaseURL + brfv4SDKName + ".js");
            document.getElementsByTagName("head")[0].appendChild(script);
        }

        // BRFv4DemoMinimal.js defines: let handleTrackingResults = function(brfv4, faces, imageDataCtx)
        // Here we overwrite it. The initialization code for BRFv4 should always be similar,
        // that's why we put it into its own file.
        //                                  namespace // tracked faces // canvas context to draw into
        function handleTrackingResults(brfv4, faces, imageDataCtx) {
            let imageDataSizes = imageData.getBoundingClientRect();
            let videoResolutions = resolution;
            let outerScaleX = imageDataSizes.width / videoResolutions.width;
            let outerScaleY = imageDataSizes.height / videoResolutions.height;
            for (let i = 0; i < faces.length; i++) {
                let face = faces[i];
                if (face.state === brfv4.BRFState.FACE_TRACKING_START ||
                    face.state === brfv4.BRFState.FACE_TRACKING) {
                    // Set position to be nose top and calculate rotation.
                    let x = face.points[27].x;
                    let y = face.points[27].y;
                    let scaleX = (face.scale / 480) * (1 - toDegree(Math.abs(face.rotationY)) / 110.0) * 2.5;
                    let scaleY = (face.scale / 480) * (1 - toDegree(Math.abs(face.rotationX)) / 110.0) * 2.5;
                    firebaseDataSvc.setMask(currentPsyId, {
                        x: x,
                        y: y,
                        scaleX: scaleX,
                        scaleY: scaleY,
                        rotationZ: face.rotationZ
                    });
                    imageDataCtx.strokeStyle="#00a0ff";
                    for(var k = 0; k < face.vertices.length; k += 2) {
                        imageDataCtx.beginPath();
                        imageDataCtx.arc(face.vertices[k], face.vertices[k + 1], 2, 0, 2 * Math.PI);
                        imageDataCtx.stroke();
                    }
                }
                return true;
            }
            return false;
        }

        function toDegree(x) {
            return x * 180.0 / Math.PI;
        }

        function onResize() {
            // implement this function in your minimal example, eg. fill the whole browser.
        }

        // Check whether we know the stream dimension yet, if so, start BRFv4.
        function onStreamDimensionsAvailable() {
            webcam = document.querySelector('#psy_video');
            if (!webcam) {
                console.log("Waiting for WebCam.");
                $timeout(onStreamDimensionsAvailable, 100);
            } else {
                //webcam.style.display = 'none';
                console.log("onStreamDimensionsAvailable: " + (webcam.videoWidth !== 0));
                if (webcam.videoWidth === 0) {
                    $timeout(onStreamDimensionsAvailable, 100);
                } else {
                    // Resize the canvas to match the webcam video size.
                    imageData.width = webcam.videoWidth;   // 640
                    imageData.height = webcam.videoHeight; // 480
                    imageDataCtx = imageData.getContext("2d");
                    window.addEventListener("resize", onResize);
                    onResize();
                    // on iOS we want to close the video stream first and
                    // wait for the heavy BRFv4 initialization to finish.
                    // Once that is done, we start the stream again.

                    // as discussed above, close the stream on iOS and wait for BRFv4 to be initialized.
                    if (isIOS) {
                        console.log("Is IOS: ", isIOS);
                        webcam.pause();
                        webcam.srcObject.getTracks().forEach(function (track) {
                            track.stop();
                        });
                    }
                    waitForSDK();
                }
            }
        }

        // Start video playback once the camera was fetched to get the actual stream dimension.
        function streamFetching() {
            console.log("streamFetching");
            // imageDataCtx is not null if we restart the camera stream on iOS.
            if (imageDataCtx === null) {
                onStreamDimensionsAvailable();
            } else {
                trackFaces();
            }
        }

        function waitForSDK() {
            if (brfv4 === null && window.hasOwnProperty("initializeBRF")) {
                // Set up the namespace and initialize BRFv4.
                // locateFile tells the asm.js version where to find the .mem file.
                // wasmBinary gets the preloaded .wasm file.
                brfv4 = {
                    locateFile: function (fileName) {
                        return brfv4BaseURL + fileName;
                    },
                    wasmBinary: brfv4WASMBuffer // Add loaded WASM file to Module
                };
                initializeBRF(brfv4);
            }

            if (brfv4 && brfv4.sdkReady) {
                initSDK();
            } else {
                $timeout(waitForSDK, 250); // wait a bit...
            }
        }

        function initSDK() {
            // The brfv4 namespace is now filled with the API classes and objects.
            // We can now initialize the BRFManager and the tracking API.
            resolution = new brfv4.Rectangle(0, 0, imageData.width, imageData.height);
            brfManager = new brfv4.BRFManager();
            brfManager.init(resolution, resolution, "com.tastenkunst.brfv4.js.examples.minimal.webcam");
            if (isIOS) {
                // Start the camera stream again on iOS.
                $timeout(function () {
                    console.log('delayed camera restart for iOS');
                    streamFetching();
                }, 2000);
            } else {
                trackFaces();
            }
        }

        function trackFaces() {
            //let timeStart = window.performance.now();
            window.requestAnimFrame(trackFaces);
            // imageDataCtx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // A virtual mirror should be... mirrored
            imageDataCtx.drawImage(webcam, 0, 0, resolution.width, resolution.height);
            // imageDataCtx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirrored for drawing the results
            brfManager.update(imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data);
            //console.log(imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data);
            if (!handleTrackingResults(brfv4, brfManager.getFaces(), imageDataCtx))
                return 0;
            // if (timeoutId >= 0) {
            //     clearTimeout(timeoutId);
            // }

            //let elapsedMs = window.performance.now() - timeStart;

            // We don't need 60 FPS, the camera will deliver at 30 FPS anyway.
            // timeoutId = $timeout(function () {
            //     trackFaces();
            // }, (1000 / 30) - elapsedMs);
        }

        function init(psy_id) {
            currentPsyId = psy_id;
            webcam = null;     // our webcam video
            imageData = document.getElementById("_imageData");  // image data for BRFv4
            imageDataSizes = imageData.getBoundingClientRect();

            initScale = imageDataSizes.width * 0.75 * 0.9 / 480; // Block width * aspect ratio * custom scale / mask height
            imageDataCtx = null;                                   // only fetch the context once
            brfv4 = null; // the library namespace
            brfManager = null; // the API
            resolution = null; // the video stream resolution (usually 640x480)
            timeoutId = -1;
            isWebAssemblySupported = null;
            // detect WebAssembly support and load either WASM or ASM version of BRFv4
            isWebAssemblySupported = _isWebAssemblySupported();
            console.log("Checking support of WebAssembly: " +
                isWebAssemblySupported + " " + (isWebAssemblySupported ? "loading WASM (not ASM)." : "loading ASM (not WASM)."));
            // Some necessary global lets... (will need to refactor Stats for BRFv5.)
            brfv4BaseURL = isWebAssemblySupported ? "lib_ext/brfv4/brf_wasm/" : "lib_ext/brfv4/brf_asmjs/";
            brfv4SDKName = "BRFv4_JS_TK101018_v4.1.0"; // the currently available library
            brfv4WASMBuffer = null;
            if (isWebAssemblySupported) {
                readWASMBinary(brfv4BaseURL + brfv4SDKName + ".wasm",
                    function (r) {
                        brfv4WASMBuffer = r; // see function waitForSDK. The ArrayBuffer needs to be added to the module object.
                        addBRFScript();
                        streamFetching();
                    },
                    function (e) {
                        console.error(e);
                    },
                    function (p) {
                        console.log(p);
                    }
                );
            } else {
                addBRFScript();
                streamFetching();
            }
        }

        let model = {};
        model.init = init;
        model.onMaskEvent = onMaskEvent;
        model.offMaskEvent = offMaskEvent;
        return model;

    }
})();
