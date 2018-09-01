;(function () {
    angular
        .module('factory.url', [])
        .factory('url', url);

    url.$inject = [];

    function url() {
        let baseUrl = 'https://api.mind-hero.grassbusinesslabs.tk/';

        return {
            user: {
                login: baseUrl + 'api/login',
            },
            consultant: {
                list: baseUrl + 'api/list-consultants',
            },
            kids: {
                list: baseUrl + 'api/list-paid-kids',
            },
            create_adm: function (token) {
                return {register: baseUrl + 'api/auth/register/' + token}
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
            create_content: baseUrl + 'api/create-content',
            delete_content: baseUrl + 'api/delete-content',
            content_my: baseUrl + 'api/content/my',
            password: {
                forgot: baseUrl + 'api/password/forgot',
                reset: baseUrl + 'api/password/reset'
            },
            schedule: {
              create: baseUrl + 'api/schedule/create',
              update: baseUrl + 'api/schedule/update',
              delete: baseUrl + 'api/schedule/delete',
              approve: baseUrl + 'api/schedule/approve',
              visible: baseUrl + 'api/schedule/visible',
              getMySchedules: baseUrl +'api/schedules/my',
              getSchedules: baseUrl + 'api/schedules',
              getMySchedulesWeeks: baseUrl +'api/schedules/my/weeks'
            }
        };
    }
})();