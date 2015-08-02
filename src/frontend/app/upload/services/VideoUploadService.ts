
module tvc {
	'use strict';

	/**
	 * Class that represents currently uploaded files.
	 */
	export class QueuedFile {
		/**
		 * Upload progrss in percent.
		 * @type {number}
		 */
		public progress : number = 0;

		public uploadFinished : ng.IPromise<string>;

		public error : boolean = false;

		public errorMessage : string = "";

		constructor(public file : File, public deferred : ng.IDeferred<string>) {
			this.uploadFinished = deferred.promise;
		}
	}

	export class VideoUploadService {

		public static $inject = [
			'$http', '$rootScope', '$q', 'VideoService'
		];

		/**
		 * Queue of files queued for upload.
		 * @type {Array}
		 */
		public uploadqueue : Array<QueuedFile> = [];

		/**
		 * Queue for already uploaded files.
		 * @type {Array}
		 */
		public uploaded : Array<QueuedFile> = [];

		constructor(private $http : ng.IHttpService, private $rootScope : ng.IRootScopeService, private $q : ng.IQService, private VideoService : VideoService){

		}

		/**
		 * Takes an array of video files and adds them to the upload queue.
		 * @param files
		 * @returns {Array<QueuedFile>}
		 */
		public queueFiles(files : Array<File>) : Array<QueuedFile> {
			var service = this,
				queued : Array<QueuedFile> = [];

			angular.forEach(files, item => {
				var file = new QueuedFile(item, service.$q.defer());
				queued.push(file);
				service.uploadqueue.unshift(file);
			});
			this.$rootScope.$apply();
			this.workQueue();
			return queued;
		}

		private workQueue() : void {
			var service = this;
			if (service.uploadqueue.length > 0) {
				service.workFile(service.uploadqueue[service.uploadqueue.length - 1]).then((file)=>{
					return file;
				}).catch(reason => {
					service.uploadqueue[service.uploadqueue.length - 1].error = true;
					service.uploadqueue[service.uploadqueue.length - 1].errorMessage = reason;
				}).finally(() => {
					service.uploaded.push(service.uploadqueue[service.uploadqueue.length - 1]);
					service.uploadqueue.pop();
					service.workQueue();
				});
			}
		}

		private workFile(file : QueuedFile) : ng.IPromise<string> {

			var service = this,
				uploader = new ChunkedUploader(this.$q,file.file,{}),
				video = new Video();
			//Fill video
			video.fields.filename = file.file.name;
			video.fields.title = file.file.name;
			//Create and upload video
			service.VideoService.createVideoInBaseFolder(video).then((createdVideo : Video)=>{
				uploader.start(MeshApi.CUSTOM_API_BASE_PATH + 'upload/' + createdVideo.uuid).then((uuid : string)=>{
					file.deferred.resolve(uuid);
				},null, (state : number) => {
					file.progress = state;
				}).catch(reason => {
					file.deferred.reject(reason);
				});
			}).catch((error)=>{
				file.deferred.reject(error);
			});
			return file.uploadFinished;
		}

	}

	export class ChunkedUploader {

		private options : any;
		private chunk_size : number;
		private file_size : number;
		private range_start : number;
		private range_end : number;
		private slice_method : string;
		private upload_request : XMLHttpRequest;
		private is_paused : boolean = false;

		private deferred : ng.IDeferred<string>;

		constructor (private $q : ng.IQService, private file : File, private opts : any) {
			var self = this;
			this.options = $.extend({
				url: '/custom/test/upload',
				chunksize : 1024 * 1024 // 1MB
			}, opts);

			this.file_size = this.file.size;
			this.chunk_size = this.options.chunksize;
			this.range_start = 0;
			this.range_end = this.chunk_size;

			if ('mozSlice' in this.file) {
				this.slice_method = 'mozSlice';
			}
			else if ('webkitSlice' in this.file) {
				this.slice_method = 'webkitSlice';
			}
			else {
				this.slice_method = 'slice';
			}

			this.deferred = this.$q.defer();

			this.upload_request = new XMLHttpRequest();
			this.upload_request.onload = () => {
				self.onChunkComplete();
			};
			this.upload_request.onerror = (reason:any) => {
				self.deferred.reject(reason);
			};
			this.upload_request.onreadystatechange = () => {
				if (self.upload_request.readyState != 4)  { return; }
				if (self.upload_request.status != 200)  {
					self.deferred.reject(self.upload_request.statusText);
				}
			};
		}

		private upload () {
			var self = this,
				chunk;

			// Slight timeout needed here (File read / AJAX readystate conflict?)
			setTimeout(() => {
				// Prevent range overflow
				if (self.range_end > self.file_size) {
					self.range_end = self.file_size;
				}

				chunk = self.file[self.slice_method](self.range_start, self.range_end);

				self.upload_request.open('PUT', self.options.url, true);
				self.upload_request.overrideMimeType('application/octet-stream');


				self.upload_request.setRequestHeader('Content-Range', 'bytes ' + self.range_start + '-' + self.range_end + '/' + self.file_size);
				self.upload_request.setRequestHeader("X-File-Name", this.file.name);
				self.upload_request.setRequestHeader("X-File-Size", ''+this.file.size);
				self.upload_request.setRequestHeader("X-File-Type", this.file.type);

				self.upload_request.send(chunk);

			}, 20);
		}

		private onChunkComplete() {
			this.deferred.notify((this.range_end/this.file_size) * 100);
			// If the end range is already the same size as our file, we
			// can assume that our last chunk has been processed and exit
			// out of the function.
			if (this.range_end === this.file_size) {
				this.deferred.resolve(this.upload_request.responseBody);
				return;
			}

			// Update our ranges
			this.range_start = this.range_end;
			this.range_end = this.range_start + this.chunk_size;

			// Continue as long as we aren't paused
			if (!this.is_paused) {
				this.upload();
			}
		}

		public start (url : string) : ng.IPromise<string> {
			if (angular.isDefined(url)) {
				this.options.url = url;
			}
			this.upload();
			return this.deferred.promise;
		}

		public pause() : void {
			this.is_paused = true;
		}

		public resume () : void {
			this.is_paused = false;
			this.upload();
		}
	};

	angular.module('tvcUpload').service('VideoUploadService', VideoUploadService);

}