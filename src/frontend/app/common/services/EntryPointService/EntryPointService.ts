
module tvc {
    'use strict';

    export class EntryPointService {

		public static $inject = [
			'$http', '$q'
		];

		private runningRequest : ng.IPromise<string>;

        constructor(private $http : ng.IHttpService, private $q : ng.IQService) {
        }

        public getEntryPointUUID() : ng.IPromise<string> {
			var deferred : ng.IDeferred<string>,
				service = this;
            if (angular.isDefined(this.runningRequest)) {
				return this.runningRequest;
			}
			deferred = this.$q.defer();
			this.runningRequest = deferred.promise;
			this.runningRequest.catch(()=>{
				service.runningRequest = undefined;
			});
			this.$http.get('/api/v1/projects').success((data) =>{
				console.log(data);
				deferred.resolve("28ec4f17e65a4148ac4f17e65a8148b2");
			}).error((error)=>{
				deferred.reject(error);
			});
			return this.runningRequest;
        }

		public getProjectName() : ng.IPromise<string> {
			var deferred = this.$q.defer();
			deferred.resolve("TVC");
			return deferred.promise;
		}
    }

    angular.module('tvcCommon').service('EntryPointService', EntryPointService);

}