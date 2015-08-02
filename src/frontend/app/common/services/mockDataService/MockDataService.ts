module tvc {

    /**
     * Generates mock response objects for use in development.
     */
    export class MockDataService {

        public getVideoResponses(count: number): {data: Array<Object>} {
            var statuses = ["uploading", "readyForTagging", "waitingForPublication", "error", "ok", "ok", "ok", "ok", "ok"],
                description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sed diam sit amet felis sollicitudin auctor ut at purus. Nulla sagittis enim congue, placerat lacus sit amet, eleifend quam.",
                response = {
                "data": [],
                "_metainfo": {}
            };

            for (var i = 0; i < count; i++) {
                response.data.push({
                    "displayField": "title",
                    "fields": {
                        "filename": "some-video-"+ i +".mp4",
                        "title": "Some Video " + i,
                        "description": description.substr(0, Math.round(Math.random() * 50) + 25),
                        "recordTime": Math.round(Math.random() * 5000 + 400).toString(),
                        "publishDate": "1436885069",
                        "depublishDate": "1438267468",
                        "previewImage": "http://lorempixel.com/240/130/nature/" + i % 10,
                        "status": statuses[Math.floor(Math.random()*statuses.length)]
                    }
                });
            }

            return response;
        }
    }

    angular.module('tvcCommon').service('MockDataService', MockDataService);
}