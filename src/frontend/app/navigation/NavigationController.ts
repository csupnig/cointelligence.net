module tvc {

	'use strict';

	export class NavigationController {

		public static $inject = [
			'$state'
		];

		constructor(private $state : ng.ui.IStateService) {
			this.init();
		}

		init() {
		}

	}

	angular.module('tvcNavigation').controller('NavigationController', NavigationController);
}
