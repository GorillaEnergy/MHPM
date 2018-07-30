;(function () {
    angular
        .module('factory.survey', [])
        .factory('survey', survey);

    survey.$inject = ['$localStorage', '$sessionStorage', 'surveyService'];

    function survey($localStorage, $sessionStorage, surveyService) {
        let model = {};
        model.setActiveSurvey = setActiveSurvey;

        return model;


        function setActiveSurvey(id, indexSurvey) {
            console.log();
        }
    }

})();