;(function () {
    angular
        .module('factory.tabs', [])
        .factory('tabs', tabs);

    tabs.$inject = ['$localStorage', '$sessionStorage'];

    function tabs($localStorage, $sessionStorage) {
        let model = {};
        model.clearAfterLogout = clearAfterLogout;

        return model;


        function clearAfterLogout() {
            $localStorage.$reset();
            $sessionStorage.$reset();
        }

    }
})();