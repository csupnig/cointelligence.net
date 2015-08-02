module tvc {

	'use strict';

	export class UploadController {

		public recentlyUploadedVideos;

		public static $inject = [
			'$state', 'VideoUploadService', 'MockDataService'
		];
		
		constructor(private $state : ng.ui.IStateService,
					public vus : VideoUploadService,
					private MockDataService: MockDataService) {
			this.recentlyUploadedVideos = this.MockDataService.getVideoResponses(7).data;
		}

		public onselectfiles(files : Array<File>) : void {
			this.vus.queueFiles(files);
		}

	}

	angular.module('tvcUpload').controller('UploadController', UploadController);
}
