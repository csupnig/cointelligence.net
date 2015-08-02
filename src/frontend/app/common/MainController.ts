module tvc {

	'use strict';

	export class MainController {

		public static $inject = [
			'$state'
		];

		constructor(private $state : ng.ui.IStateService) {
			this.init();
		}

		init() {
		}

	}

	angular.module('tvcCommon').controller('MainController', MainController);
}
