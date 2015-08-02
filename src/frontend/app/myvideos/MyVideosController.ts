module tvc {

	'use strict';

	export class MyVideosController {

		private videos;

		public static $inject = [
			'$state', 'VideoService'
		];

		constructor(private $state : ng.ui.IStateService,
					private VideoService: VideoService) {
			this.init();
		}

		init() {
			var controller = this;
			this.VideoService.getVideos().then((videos) => {
				controller.videos = videos;
			})
		}

	}

	angular.module('tvcMyVideos').controller('MyVideosController', MyVideosController);
}
