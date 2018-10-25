;(function () {
    'use strict';

    angular
        .module('service.authService', [])
        .service('authService', authService);

    authService.$inject = ['http', 'url', '$localStorage', '$state', 'toastr', 'RTCService', '$mdDialog', 'firebaseDataSvc', 'modalSvc'];

    function authService(http, url, $localStorage, $state, toastr, RTCService, $mdDialog, firebaseDataSvc, modalSvc) {

        let model = {};
        model.login = login;
        model.logout = logout;
        model.getToken = getToken;
        model.setToken = setToken;
        model.getUser = getUser;
        model.setUser = setUser;
        model.forgotPass = forgotPass;
        model.resetPass = resetPass;
        model.updateInfo = updateInfo;
        model.updatePass = updatePass;


        return model;

        function login(data) {
            return http.post(url.user.login, data).then(function (res) {
                console.log(res);
                if (res.status === 'success') {
                    firebaseDataSvc.setOnlineStatus(res.data.user.id, true);
                    $localStorage.token = res.data.token;
                    $localStorage.user = res.data.user;
                    toastr.success('Authorization success');
                    $state.go('tabs.statistic')
                } else {
                    toastr.error('Authorization error')
                }
            })
        }

        function logout() {
            console.log('logout');
            let user_id = $localStorage.user.id;
            if (RTCService.accessToGo()) {
                firebaseDataSvc.setOnlineStatus(user_id, false);
                firebaseDataSvc.off();
                $localStorage.$reset();
                $state.go('authorization.login')
            } else {
                console.log('show warning');
                modalSvc.warningStateGo();
            }
        }
        function getToken() {
            return $localStorage.token;
        }
        function setToken(token) {
            $localStorage.token = token;
        }
        function getUser() {
            return $localStorage.user;
        }
        function setUser(user) {
            $localStorage.user = user;
        }
        function forgotPass(data) {
            return http.post(url.password.forgot, data);
        }
        function resetPass(data) {
            return http.post(url.password.reset, data);
        }
        function updateInfo(id , data) {
            return http.post(url.user_func(id).updateProfile , data);
        }

        function updatePass(id , data) {
            return http.post(url.user_func(id).updateProfile , data);
        }


    }
})();