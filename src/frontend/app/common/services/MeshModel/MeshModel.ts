
module tvc {
	'use strict'

	export class MeshApi {
		public static API_BASE_PATH = '/api/v1/';
		public static CUSTOM_API_BASE_PATH = '/custom/tvc/';
	}

	export class MeshSchema {
		name : string;
		uuid : string;
	}

	export class MeshNode {
		public uuid : string;
		public creator : any;
		public created : number;
		public edited : number;
		public language : string;
		public permissions : Array<string>;
		public published : boolean;
		public tags : Array<any>;
		public schema : MeshSchema;
		public container : boolean;
		public parentNodeUuid : string;
	}

	export class VideoFields {
		public filename : string;
		public apauuid : string;
		public title : string;
		public producer : string;
		constructor(){}
	}

	export class Video extends MeshNode {
		fields : VideoFields;
		constructor(){
			super();
			this.fields = new VideoFields();
		}
	}
}