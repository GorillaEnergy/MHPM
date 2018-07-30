;(function () {
    'use strict';

    angular
        .module('service.surveyService', [])
        .service('surveyService', surveyService);

    surveyService.$inject = ['http', 'url' , '$sessionStorage'];

    function surveyService(http, url ,  $sessionStorage) {
        let model = {};

        model.loadItems = loadItems;
        model.setItems = setItems;
        model.getItems = getItems;

        model.loadSurveyOnly = loadSurveyOnly;
        model.getSurveyOnly = getSurveyOnly;
        model.getCustomerSurveys = getCustomerSurveys;

        model.getSelectedSurveys = getSelectedSurveys;

        model.loadOneSurvey = loadOneSurvey;

        model.createSurvey = createSurvey;
        model.updateSurvey = updateSurvey;
        model.deleteSurvey = deleteSurvey;
        model.loadDeletedQuestionsInSurvey = loadDeletedQuestionsInSurvey;
        model.changeStatusSurvey = changeStatusSurvey;
        model.archiveStatusSurvey = archiveStatusSurvey;


        return model;

        function loadItems() {
            return http.get(url.user.getItems, {}).then(function (res) {
                if (res.success) {
                    setItems(res.data);

                }
            });
        }
        function setItems(items) {
            delete $sessionStorage['user_items'];
            $sessionStorage['user_items'] = items;
        }
        function getItems() {
            return $sessionStorage['user_items'];
        }

        function loadOneSurvey(id) {
            return http.get(url.survey_management_func(id).loadOneSurvey, {});
        }

        ////////////////////////////////
        function loadSurveyOnly() {
            return http.get(url.survey_management_func().loadOnlySurvey, {}).then(function (res) {
                if(res.success){
                    setSurveyOnly(res.data.onlySurvey);
                    return res;
                }
            });
        }
        function setSurveyOnly(data) {
            delete $sessionStorage['survey_only'];
            $sessionStorage['survey_only'] = data;
        }
        function getSurveyOnly() {
            return $sessionStorage['survey_only'];
        }
        function getCustomerSurveys() {
            return $sessionStorage.chosen_survey;
        }

        ///
        function getSelectedSurveys() {
            return $sessionStorage['chosen_survey'];
        }


        /////////////////////////////////////
        function createSurvey (data) {
            return http.post(url.survey_management.createSurvey, data);
        }

        function updateSurvey(id, data) {
            return http.put(url.survey_management_func(id).updateSurvey, data);
        }

        function deleteSurvey(id) {
            return http.delete(url.survey_management_func(id).updateSurvey);
        }

        function loadDeletedQuestionsInSurvey(id) {
            return http.get(url.survey_management_func(id).deletedQuestionsInSurvey);
        }

        function changeStatusSurvey (id) {
            return http.put(url.survey_management_func(id).changeStatusSurvey);
        }

        function archiveStatusSurvey (id) {
            return http.put(url.survey_management_func(id).archiveStatusSurvey);
        }


    }
})();