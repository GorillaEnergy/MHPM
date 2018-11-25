;(function () {
    'use strict';

    angular
        .module('service.rtcExtSvc', [])
        .service('rtcExtSvc', rtcExtSvc);

    rtcExtSvc.$inject = ['$q', 'http', 'url', 'firebaseDataSvc'];

    function rtcExtSvc($q, http, url, firebaseDataSvc) {
        let servers = [];
        let currentUserList = []; //contain object { id: , lastVideoTime: }
        let checkerHandler;
        let timeWriteHandler;
        let currentPsy;
        let model = {
            init: init,
            getServers: getServers,
            getXirsysServer: getXirsysServer,
            startAutoCheckerUserVideo: startAutoCheckerUserVideo,
            startAutoSetLastTime: startAutoSetLastTime,
            addUserToCheck: addUserToCheck,
            removeUserFromCheck: removeUserFromCheck
        };
        const TIME_CHECK_VIDEO = 8 * 1000;
        const TIME_WRITE_LASTTIME = 10 * 1000;

        function init() {
            getXirsysServer();
        }

        function getServers() {
            return servers;
        }

        function getXirsysServer() {
            if (servers.length) {
                return $q.when(servers);
            }
            return http.get(url.rtc_servers.all).then(function (res) {
                servers = res.data ? res.data : [];
            });
        }


        function startAutoSetLastTime(psyId) {
            currentPsy = psyId;
            timeWriteHandler = setInterval(function () {
                firebaseDataSvc.setPsyLastTime(psyId, new Date().getTime());
            },TIME_WRITE_LASTTIME);
        }

        function startAutoCheckerUserVideo(psyId) {
            if(checkerHandler) return;
            currentUserList = [];
            currentPsy = psyId;
            checkerHandler = setInterval(checkUserVideoLive, TIME_CHECK_VIDEO);
        }

        function checkUserVideoLive(){
            let removeId = false;
            currentUserList.forEach(function (val) {
                let video = $('[data-number="' + val.id + 'mhuser"]').get(0);
                if (video && video.currentTime && val.id) {
                    if (video.currentTime > 0 && video.currentTime === val.lastVideoTime) {
                        firebaseDataSvc.setPsyChildNeedReload(currentPsy, val.id);
                        removeId = val.id;
                    } else {
                        val.lastVideoTime = video.currentTime;
                    }
                }
            });
            if(removeId)removeUserFromCheck(removeId);
        }

        function addUserToCheck(userId) {
            currentUserList.push({
                id: userId,
                lastVideoTime: 0
            });
        }

        function removeUserFromCheck(userId) {
            let index = currentUserList.findIndex(function (item) {
                return +item.id === +userId;
            });
            currentUserList.splice(index,1);
        }

        return model;
    }
})();