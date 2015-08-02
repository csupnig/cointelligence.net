
module tvc {
	'use strict'



	export class VideoService {

		public static $inject = [
			'$http', '$q', 'MockDataService', 'EntryPointService', 'LanguageService'
		];

		constructor(private $http : ng.IHttpService, private $q : ng.IQService, private mockDataService : MockDataService, private EntryPointService : EntryPointService, private LanguageService : LanguageService) {
		}

		getVideos() : ng.IPromise<Array<Object>> {
			var service = this;

			return this.EntryPointService.getEntryPointUUID().then((uuid)=>{
				return service.mockDataService.getVideoResponses(16).data;
			});
		}

		createVideoInBaseFolder(video : Video) : ng.IPromise<Video> {
			var service = this;
			return this.EntryPointService.getEntryPointUUID().then((uuid) => {
				return service.createVideo(uuid, video);
			})
		}

		createVideo(folderUUID : string, video : Video) : ng.IPromise<Video> {
			var service = this;
			if (!angular.isDefined(video.schema)) {
				video.schema = new MeshSchema();
				video.schema.name = 'video';
			}
			if (!angular.isDefined(video.parentNodeUuid)) {
				video.parentNodeUuid = folderUUID;
			}
			if (!angular.isDefined(video.language)) {
				video.language = service.LanguageService.getDefaultLanguage();
			}
			return service.EntryPointService.getProjectName().then((project)=>{
				return service.$http.post(MeshApi.API_BASE_PATH + project + "/nodes/", video);
			});
		}
	}

	angular.module('tvcCommon').service('VideoService', VideoService);

}