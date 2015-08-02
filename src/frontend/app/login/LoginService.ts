
module tvc {
	'use strict';

	export class LoginService {

    private loggedIn : boolean;
    private  authString : string;
		static CODE_RESPONSE_UNAUTHORIZED = 401;
		static AUTH_HEADER_NAME = 'Authorization';

		public static $inject = [
			'$injector'
		];

		constructor(private $injector:ng.auto.IInjectorService){

		}

		public login(username : string, password : string) : void {
			var service = this,
					$http : ng.IHttpService = this.$injector.get("$http"),
					$state : ng.ui.IStateService = this.$injector.get("$state");

			this.authString = "Basic " + service.toBase64(username + ":" + password);
			this.loggedIn = true;

			$http.get('/api/v1/auth/me').
			  success(function(data, status, headers, config) {
					$state.go("app.upload");
			  }).
			  error(function(data, status, headers, config) {
					if (status === LoginService.CODE_RESPONSE_UNAUTHORIZED)
					{
						//TODO: Display error message
						console.log('not authorized');
					}
			  });
		}

    public isLoggedIn() : boolean{
      return this.loggedIn;
    }

		public getAuthValue() : string {
			return this.authString;
		}

    public logout() : void {
      this.loggedIn = false;
      this.authString = '';
    }

		private toBase64(input : string) : string {
			var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
			var output = "";
      var chr1, chr2, chr3 = null;
      var enc1, enc2, enc3, enc4 = null;
      var i = 0;

      do {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }

          output = output +
              keyStr.charAt(enc1) +
              keyStr.charAt(enc2) +
              keyStr.charAt(enc3) +
              keyStr.charAt(enc4);
          chr1 = chr2 = chr3 = "";
          enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

        return output;
		}
  }
	angular.module('tvcLogin').service('LoginService', LoginService);

}
