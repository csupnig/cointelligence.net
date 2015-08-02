module tvc {
    'use strict';
    export class UserAuthHttpInterceptor {
        static CODE_RESPONSE_UNAUTHORIZED = 401;
        static AUTH_HEADER_NAME = 'Authorization';

        public static $inject = [
            "$rootScope",
            "$q",
            'LoginService',
            '$injector'
        ];

        constructor(public $rootScope, public $q, private loginService : LoginService, private $injector:ng.auto.IInjectorService) {
            // this corresponds in res
        }

        public responseError = (response) => {
            // check for CONFLICT response
            // NOTE: this code is the result of an expired auth token
            if (response.status === UserAuthHttpInterceptor.CODE_RESPONSE_UNAUTHORIZED) {
                var $state : ng.ui.IStateService = this.$injector.get("$state");
                this.loginService.logout();
                $state.go("login");

            }
            return this.$q.reject(response);
        };

        public request = (config) => {

            if (this.loginService.isLoggedIn()){
              config.headers[UserAuthHttpInterceptor.AUTH_HEADER_NAME] = this.loginService.getAuthValue();
            }

            return config;
        };

    }
    angular.module("tvcLogin").service("UserAuthHttpInterceptor", UserAuthHttpInterceptor);
}
