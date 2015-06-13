app.factory('authInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                var token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            responseError: function (response) {
                var status = response.status;
                if(status === 401) {
                    $rootScope.$emit('unauthorized');
                }
                return $q.reject(response);
            }
        };
    }]);