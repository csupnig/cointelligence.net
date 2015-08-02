module tvc {

	'use strict';

	export class LoginController {

		public static $inject = [
			'LoginService',
			'$state'
		];

		public username : string;
		public password : string;

		constructor(private loginService : LoginService, private $state : ng.ui.IStateService) {

		}

		public login() {
			this.loginService.login(this.username, this.password);
		}

	}

	angular.module('tvcLogin').controller('LoginController', LoginController);
}
