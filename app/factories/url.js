;(function () {
    angular
        .module('factory.url', [])
        .factory('url', url);

    url.$inject = [];

    function url() {
        let baseUrl = 'http://api.knightshayes.grassbusinesslabs.tk/';

        return {
            user: {
                login: baseUrl + 'api/auth/login',
                loadUser: baseUrl + 'api/user',
                getItems: baseUrl + 'api/survey',
                loadSurveysOnly: baseUrl + 'api/onlysurvey',
                forgot: baseUrl + 'api/user/request-reset',
                inviteAdm: baseUrl + 'api/send-invite',
                reSend: baseUrl + 'api/resend-invite'
            },
            create_adm: function (token) {
                return {register: baseUrl + 'api/auth/register/' + token}
            },
            company: {
                createCompany: baseUrl + 'api/company',
                company: baseUrl + 'api/companies',
                companyAdmin: baseUrl + 'api/company-own',
                changeFA: baseUrl + 'api/customers/change-fa'
            },
            company_func: function (id) {
                return {
                    company: baseUrl + 'api/company/' + id,
                    assignTemplate: baseUrl + 'api/company/' + id + '/assign',
                    activeSendEmail: baseUrl + 'api/active-send-email',
                    deactivateSendEmail: baseUrl + 'api/deactivate-send-email',
                    deleteAdm: baseUrl + 'api/user/' + id + '/delete',
                    cancelInv: baseUrl + 'api/invite/' + id + '/delete',
                    companyCustomers: baseUrl + 'api/company/' + id + '/customers',
                    selectedSurvTempInCompany: baseUrl + 'api/company/' + id + '/index-assigns',
                    companySurveys: baseUrl + 'api/company/' + id + '/available-surveys'
                }
            },
            survey_management: {
                createSurvey: baseUrl + 'api/survey'
            },
            reset_func: function (token) {
                return {resetPass: baseUrl + 'api/user/reset-password?token=' + token}
            },
            user_func: function (id) {
                return {updateProfile: baseUrl + 'api/user/' + id}
            },
            survey_management_func: function (id) {
                return {
                    loadOnlySurvey: baseUrl + 'api/onlysurvey',
                    loadOneSurvey: baseUrl + 'api/survey/' + id,
                    updateSurvey: baseUrl + 'api/survey/' + id,
                    deleteSurvey: baseUrl + 'api/survey/' + id,
                    deletedQuestionsInSurvey: baseUrl + 'api/survey/' + id + '/deleted-questions',
                    changeStatusSurvey: baseUrl + 'api/survey/' + id + '/change-status',
                    archiveStatusSurvey: baseUrl + 'api/survey/' + id + '/archive-status',
                    block: baseUrl + 'api/survey/' + id + '/add-block',
                    createBlock: baseUrl + 'api/survey/' + id + '/add-block',
                    updateBlock: baseUrl + 'api/block/' + id,
                    orderUpdate: baseUrl + 'api/survey/' + id + '/order-update',
                    //
                    addBlockQuestion: baseUrl + 'api/block/' + id + '/add-block-questions',
                    updateQuestion: baseUrl + 'api/question/' + id,
                    updateAnswer: baseUrl + 'api/answer/' + id,
                };
            },
            customers: {
                customers: baseUrl + 'api/customer',
                getCustomerCommonAnswer: baseUrl + 'api/get-values-for-questions',
                createCustomerCommonAnswer: baseUrl + 'api/create-common-question-value'
            },
            customers_func: function (id) {
                return {
                    updateCustomers: baseUrl + 'api/customer/' + id,
                    sendCustomerAnswer: baseUrl + 'api/customer/' + id + '/make-answer',
                    getCustomerAnswer: baseUrl + 'api/customer/' + id.customer + '/survey/' + id.survey + '/list'
                };
            },
            report: {
                createReport: baseUrl + 'api/report'
            },

            contract_research_func: function (id) {
                return {
                    createResearch: baseUrl + 'api/new-contract-research',
                    deleteResearch: baseUrl + 'api/contract-research/' + id
                };
            },

            contract_editor_func: function (id) {
                return {
                    createSurveyTemplate: baseUrl + 'api/contract-research/' + id + '/contract',
                    getOneTemplate: baseUrl + 'api/contract/' + id,
                    getTemplates: baseUrl + 'api/contract',
                    getTemplatesForThePool: baseUrl + 'api/survey/' + id + '/contracts',
                    getTemplateList: baseUrl + 'api/onlycontract',
                    deleteTemplate: baseUrl + 'api/contract/' + id,
                    updateTemplate: baseUrl + 'api/contract/' + id,
                    createVariability: baseUrl + 'api/variable',
                    getVariability: baseUrl + 'api/variable',
                    getVariabilityWithDeleted: baseUrl + 'api/variable-all',
                    editVariability: baseUrl + 'api/variable/' + id,
                    deleteVariability: baseUrl + 'api/variable/' + id
                };
            },

            contract_image_func: function (id) {
                return {
                    uploadImage: baseUrl + 'api/contract-research/' + id + '/save-image',
                    imageListInResearch: baseUrl + 'api/contract/' + id + '/image-list',
                    deleteImage: baseUrl + 'api/contract/image/' + id
                };
            },

            contract_download_func: function (idReport, idContract, filename) {
                return {
                    downloadPDF: baseUrl + 'api/report/' + idReport + '/contract/' + idContract + '/review/' + filename,
                    removePDF: baseUrl + 'api/storage/contracts/' + idReport,
                    sendContractToEmail: baseUrl + 'api/report/' + idReport + '/contract/' + idContract + '/send-contract/' + filename
                };
            },

            logout_func: function (token) {
                return {
                    logout: baseUrl + 'api/logout?token=' + token
                };
            },

            risk_func: function (id) {
                return {
                    getRisks: baseUrl + 'api/get-risks',
                    createRisk: baseUrl + 'api/add-risk',
                    updateRisk: baseUrl + 'api/update-risk/' + id,
                    deleteRisk: baseUrl + 'api/delete-risk/' + id
                };
            },

            // common_func: function () {
            //     return {
            //         getCommon: baseUrl + 'api/get-common-questions',
            //         createCommon: baseUrl + 'api/create-common-question',
            //         deleteCommon: baseUrl + 'api/delete-common-question'
            //     };
            // }

            common_func:{
                getCommon: baseUrl + 'api/get-common-questions',
                createCommon: baseUrl + 'api/create-common-question',
                deleteCommon: baseUrl + 'api/delete-common-question'
            }

        };
    }

})();