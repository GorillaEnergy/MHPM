;(function () {
    'use strict';

    angular
        .module('service.utilsSvc', [])
        .service('utilsSvc', utilsSvc);

    utilsSvc.$inject = ['http', 'url', '$localStorage', '$state', 'toastr'];

    function utilsSvc(http, url, $localStorage, $state, toastr) {

        let model = {
            objToArr: objToArr,
            totalTime: totalTime,
            init: init,
            isBrowser: isBrowser
        };

        return model;

        function isBrowser() {
            return {
                opera: function () {
                    return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
                },

                firefox: function () {
                    return typeof InstallTrigger !== 'undefined';
                },
                safari: function () {
                    return /constructor/i.test(window.HTMLElement) || (function (p) {
                        return p.toString() === "[object SafariRemoteNotification]";
                    })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
                },
                ie: function () {
                    return /*@cc_on!@*/false || !!document.documentMode;
                },
                edge: function () {
                    return !isIE && !!window.StyleMedia;
                },
                chrome: function () {
                    return !!window.chrome && !!window.chrome.webstore;
                },
                blink: function () {
                    return (isChrome || isOpera) && !!window.CSS;
                }
            }
        }

        function init() {
            findIndexPolyfill();
        }

        function totalTime(data) {
            let start, end, total_second, total_minutes, total_hours;
            start = data.start_time;
            end = new Date();
            total_second = Math.floor((end - start) / 1000);
            total_minutes = Math.floor(total_second / 60);
            total_hours = Math.floor(total_minutes / 60);
            total_minutes = total_minutes - total_hours * 60;
            total_minutes = total_minutes < 10 ? '0' + total_minutes : total_minutes;
            total_hours = total_hours < 10 ? '0' + total_hours : total_hours;
            return total_hours + ':' + total_minutes;
        }

        function objToArr(obj) {
            return Object.keys(obj).map((v, i) => {
                return obj[v];
            });

        }


        function findIndexPolyfill() {
            if (!Array.prototype.findIndex) {
                Array.prototype.findIndex = function (predicate) {
                    if (this == null) {
                        throw new TypeError('Array.prototype.findIndex called on null or undefined');
                    }
                    if (typeof predicate !== 'function') {
                        throw new TypeError('predicate must be a function');
                    }
                    var list = Object(this);
                    var length = list.length >>> 0;
                    var thisArg = arguments[1];
                    var value;

                    for (var i = 0; i < length; i++) {
                        value = list[i];
                        if (predicate.call(thisArg, value, i, list)) {
                            return i;
                        }
                    }
                    return -1;
                };
            }
        }


    }
})();