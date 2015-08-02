
module tvc{
    'use strict';

    angular.module('tvc', [
		'CointelligenceTplCache',
		'tvcNavigation',
		'tvcCommon',
		'tvcUpload',
		'tvcMyVideos',
		'tvcEditVideo',
		'tvcDirectives',
    'tvcLogin',
		'ngResource',
		'ngAnimate',
		'ngMessages',
		'ngSanitize',
		'ui.router',
		'pascalprecht.translate'
	]).config(['$translateProvider', '$stateProvider', '$httpProvider', '$urlRouterProvider', ($translateProvider, $stateProvider : ng.ui.IStateProvider, $httpProvider : ng.IHttpProvider, $urlRouterProvider : ng.ui.IUrlRouterProvider) => {

    $httpProvider.interceptors.push('UserAuthHttpInterceptor');
		$translateProvider.useStaticFilesLoader({
			prefix: 'languages/lang-',
			suffix: '.json'
		});
		$translateProvider.useMessageFormatInterpolation();
		$translateProvider.preferredLanguage('de_DE');
		$translateProvider.useSanitizeValueStrategy('sanitize');
		MessageFormat.locale.de_DE=function(n){return n===1?"one":"other"};

		$stateProvider
			.state('app', {
				abstract: true,
				url: '/',
				views: {
					'':{
						controller: 'MainController',
						controllerAs: 'vm',
						templateUrl: 'app/common/main.tpl.html'
					},
					'navigation@app': {
						controller: 'NavigationController',
						controllerAs: 'vm',
						templateUrl: 'app/navigation/navigation.tpl.html'
					},
				}
			})
			.state('app.myvideos', {
				url: '',
				views: {
					'content': {
						controller:'MyVideosController',
						controllerAs: 'vm',
						templateUrl:'app/myvideos/myvideos.tpl.html'
					}
				}
			})
			.state('app.editvideo', {
				url: 'video',
				views: {
					'content': {
						controller:'EditVideoController',
						controllerAs: 'vm',
						templateUrl:'app/editvideo/editvideo.tpl.html'
					}
				}
			})
			.state('app.upload', {
				url: 'upload',
				views: {
					'content': {
						controller:'UploadController',
						controllerAs: 'vm',
						templateUrl:'app/upload/upload.tpl.html'
					}
				}
			}).state('login', {
				url: '/login',
				views: {
					'':{
						controller: 'LoginController',
						controllerAs: 'vm',
						templateUrl: 'app/login/login.tpl.html'
					}
				}
			});
		$urlRouterProvider.otherwise('/');
	}]);

}
