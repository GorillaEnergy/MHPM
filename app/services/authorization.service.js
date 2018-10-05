;(function () {
    'use strict';

    angular
        .module('service.authService', [])
        .service('authService', authService);

    authService.$inject = ['http', 'url', '$localStorage', '$state', 'toastr', 'RTCService', '$mdDialog'];

    function authService(http, url, $localStorage, $state, toastr, RTCService, $mdDialog) {

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
                    firebase.database().ref('/WebRTC/users/' + res.data.user.id + '/online').set(true);
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
            let user_id = angular.copy($localStorage.user.id);
            if (RTCService.accessToGo()) {
                firebase.database().ref('/WebRTC/users/' + user_id + '/online').set(false);
                firebase.database().ref().off();
                $localStorage.$reset();
                $state.go('authorization.login')
            } else {
                console.log('show warning');
                $mdDialog.show({
                    controller: 'StateGoWarning',
                    controllerAs: 'vm',
                    templateUrl: 'components/state-go-warning/state-go-warning.html',
                    clickOutsideToClose: true
                })
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