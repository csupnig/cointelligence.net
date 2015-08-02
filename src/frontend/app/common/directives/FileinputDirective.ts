
module tvc {
	'use strict';

	export interface IFileinputDirectiveScope extends ng.IScope {
		onselect : (FileList)=>void;
	}

	export class FileinputDirective {
		public static $inject: Array<string> = [];
		constructor() {
			var directive: ng.IDirective = {};
			directive.priority = 0;
			directive.restrict = "A";
			directive.transclude = true;
			directive.templateUrl = "app/common/directives/fileinput.tpl.html";
			directive.replace = true;
			directive.scope = {
				onselect : "&"
			};
			directive.link = function ($scope : IFileinputDirectiveScope, $element:any, attrs:any) {
				var $fileinput = $element.find('.fileinput'),
					$fileuploadcontainer = $element.find('.uploadpanel');
				$fileuploadcontainer.click((e) => {
					e.preventDefault();
					$fileinput.trigger('click');
					return false;
				});
				$fileuploadcontainer.on('dragenter', (e) => {
					$fileuploadcontainer.addClass('dragover');
				}).on('dragover', (e) => {
					e.stopPropagation();
					e.preventDefault();
					$fileuploadcontainer.addClass('dragover');
					e.originalEvent.dataTransfer.dropEffect = 'copy';
				}).on('dragleave',(e)=>{
					$fileuploadcontainer.removeClass('dragover');
				}).on('drop', (e) => {
					e.preventDefault();
					$fileuploadcontainer.removeClass('dragover');
					$scope.onselect({'files':e.originalEvent.dataTransfer.files});
				});
				$fileinput.on('change', (e) => {
					$scope.onselect({'files':e.target.files});
				})

			};

			return directive;
		}
	}

	angular.module('tvcCommon').directive('fileinput', FileinputDirective);
}
