(function () {
    'use strict';
    angular
        .module('factory.request', [])
        .factory('http', http);

    http.$inject = ['$http', '$q', '$localStorage' , 'toastr'];

    /**
     * Wrapper over the standard http function
     */

    function http($http, $q, $localStorage , toastr) {
        console.log('create request service');

        return {
            get: function (url, data) {
                return request('GET', url, data);
            },
            post: function (url, data) {
                return request('POST', url, data);
            },
            put: function (url, data) {
                return request('PUT', url, data);
            },
            delete: function (url, data) {
                return request('DELETE', url, data);
            }
            // file: function (url, data) {
            //     return requestFile(url, data);
            // }
        };


        /**
         * Main request function
         * @param {string} method - Method name
         * @param {string} url - Request url
         * @param {object} data - Data to request
         * @returns {promise}
         */

        function request(method, url, data) {

            let token = $localStorage.token;


            let config = {
                dataType: 'json',
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };
            if(typeof token != 'undefined') {
                config.headers.token = token;
            }

            if (method === 'GET') {
                config.params = data;
                config.timeout = 20000;
            }
            else {
                config.data = data;
            }

            config.url = url;

            // console.log(config, 'data for sand');

            return $http(config)
                .then(requestComplete)
                .catch(requestFailed);
        }

        /**
         * Function for sending files
         * @param {string} url - Request url
         * @param {object} data - Data to request
         * @returns {promise}
         */

        // function requestFile(url, data) {
        //
        //     // if ($sessionStorage.auth_key) {
        //     //     url = url + '?auth_key=' + $sessionStorage.auth_key;
        //     // }
        //
        //     var ft = new FileTransfer();
        //
        //     var promise = $q.defer();
        //     ft.upload(data.file.fullPath, encodeURI(url), function (response) {
        //         console.info('response complete', JSON.parse(response.response));
        //         promise.resolve(JSON.parse(response.response));
        //     }, function (error) {
        //         console.log('error', error);
        //         promise.reject(error.body);
        //     }, {
        //         fileName: data.file.name,
        //         fileKey: 'file',
        //         mimeType: 'video/mp4',
        //         httpMethod: 'POST',
        //         chunkedMode: false,
        //         params: data
        //     });
        //
        //     return promise.promise;
        // }


        /**
         * Callback function for failed request
         * @param err
         * @returns {promise}
         */
        function requestFailed(err) {
            console.info('error', err);

            if (err.data == null || !err.data.error) {
                if (err.status === 200) {
                    toastr.error('Server error: ' + err.data);
                }
                else if (err.status === -1) {
                    toastr.error('Server is not available');
                }
                else if (err.status === 0) {
                    toastr.error('There is no Internet connection');
                }
                else if (err.status === 500) {
                    toastr.error('Server error: ' + err.status + ' ' + err.data.message);
                }
                else {
                    toastr.error('Server error: ' + err.status + ' ' + err.statusText);
                }
            }
            else {
                toastr.error(err.data.error);

            }

            return {status: false};
        }

        /**
         * Callback function for success request
         * @param response
         * @returns {promise}
         */

        function requestComplete(response) {
            // let promise = $q.defer();
            // console.info('response complete', response.config.url);
            // // console.log(!response.data.status, '123')
            // if (response.data.status) {
            //     promise.resolve(response.data);
            // }
            // else {
            //     promise.reject(response.data);
            // }
            console.log(response, 'request response');

            return response.data;


        }
    }
})();