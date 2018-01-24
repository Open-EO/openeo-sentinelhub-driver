export function initOpenEO() {
    var eoObj = {
        url : "http://localhost:8080/",

        imagecollection: function (collId) {
            return new SourceDatasetNode(collId);
        },
        
        parseScript(script) {
            var openEO = this;
            return eval('( () => {'+script+'})()');
        },

        createJob(processGraph) {
            return fetch(this.url+'/jobs', {
                method: 'POST',
                body: JSON.stringify({ "process_graph" : processGraph })
            });
        },

        getWcsUrl(job_id) {
            return this.url+'/download/'+job_id+'/wcs';
        }
    };

    var process = eoObj.parseScript(`return openEO
    .imagecollection('Sentinel2A-L1C')
    .filter_daterange("2016-01-01","2016-03-10")
    .NDI(8,4)
    .min_time();`);
    
    eoObj.createJob(process).then(res => console.log(eoObj.getWcsUrl(res)));

    return eoObj;
}

class ImageCollectionNode {
    constructor() {

    };

    filter_daterange(startT, endT) {
        return new ProcessNode("filter_daterange", {"collections": [this], "from": startT, "to": endT});
    }

    filter_bbox(box, crs = "EPSG:4326") {
        return new ProcessNode("filter_bbox", {"collections": [this], "srs": crs, "bbox": box});
    }

    NDI(first, second) {
        return new ProcessNode("NDI",{"collections": [this], "band1":first, "band2":second});
    }

    min_time() {
        return new ProcessNode("min_time",{"collections": [this]});
    }
}

class ProcessNode extends ImageCollectionNode {
    constructor(process_id, args) {
        super();
        this.process_id = process_id;
        this.args = args;
    }
}

class SourceDatasetNode extends ImageCollectionNode {
    constructor(srcId) {
        super();
        this.product_id = srcId;
    }
}