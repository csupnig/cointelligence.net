
module tvc {
	'use strict';

    /**
     * Video thumbnail preview component. Should be passed an video node response object via the `video` attribute.
     *
     * @returns {{restrict: string, templateUrl: string, controller: string, controllerAs: string, bindToController: boolean, scope: {video: string}}}
     * @constructor
     */
	export function VideoThumbDirective(): ng.IDirective {

        return {
            restrict: 'E',
            templateUrl: 'app/common/directives/videoThumb/videoThumb.tpl.html',
            controller: 'VideoThumbDirectiveController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                video: '='
            }
        }
    }

    class VideoThumbDirectiveController {

        public video;

        /**
         * Returns the appropriate Font Awesome icon name to represent the state of the video.
         * @returns {any}
         */
        getStatusIcon(): string {
            var statusIcon;

            switch (this.video.fields.status) {
                case 'uploading':
                    statusIcon = 'fa-cloud-upload';
                    break;
                case 'readyForTagging':
                    statusIcon = 'fa-tag';
                    break;
                case 'waitingForPublication':
                    statusIcon = 'fa-clock-o';
                    break;
                case 'error':
                    statusIcon = 'fa-exclamation-triangle';
                    break;
                default:
                    statusIcon = '';
                    break;
            }

            return statusIcon;
        }

        /**
         * Is the video incomplete - i.e. not yet uploaded/processed or there was an error.
         * @returns {boolean}
         */
        videoIsIncomplete(): boolean {
            return this.video.fields.status == 'error' || this.video.fields.status == 'uploading';
        }

        timestampToHMS(timestamp: string): string {
            var date = new Date(parseInt(timestamp)* 1000),
                hours = date.getHours(),
                minutes = "0" + date.getMinutes(),
                seconds = "0" + date.getSeconds();

            return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        }
    }


	angular.module('tvcCommon')
        .directive('videoThumb', VideoThumbDirective)
        .controller('VideoThumbDirectiveController', VideoThumbDirectiveController);
}
