;(function () {
    'use strict';

    angular
        .module('service.authService', [])
        .service('authService', authService);

    authService.$inject = ['http', 'url', '$localStorage'];

    function authService(http, url, $localStorage) {

        let model = {};
        model.login = login;
        model.getToken = getToken;
        model.setToken = setToken;
        model.getUser = getUser;
        model.setUser = setUser;

        model.forgot = forgot;
        model.updateInfo = updateInfo;
        model.updatePass = updatePass;


        return model;

        function login(credentials) {
            return http.post(url.user.login, credentials)
        }
        function getToken() {
            return $localStorage.token;
        }
        function setToken(token) {
            $localStorage.token = token;
        }
        function getUser() {
            return $localStorage.token;
        }
        function setUser(user) {
            $localStorage.user = user;
        }
        function forgot(data) {
            return http.post(url.user.forgot, data);
        }
        function updateInfo(id , data) {
            return http.post(url.user_func(id).updateProfile , data);
        }

        function updatePass(id , data) {
            return http.post(url.user_func(id).updateProfile , data);
        }


    }
})();