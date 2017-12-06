module.exports = function(server_storage) {
    var module = {};

    module.createJobCacheKey = function(uuid) {
        return "job." + uuid;
    };

    const errors = require('restify-errors');
    const turf = {
        bboxPolygon: require('@turf/bbox-polygon'),
        bboxClip: require('@turf/bbox-clip')
    };

    const processRegistry = {
        processes: {},

        buildNode(json) {
            const process_id = json["process_id"];
            if (process_id) {
                return this.findNode(process_id, json["args"]);
            }
            const product_id = json["product_id"];
            if (product_id) {
                return new node_product(product_id);
            }
            throw error.BadRequestError("Unknown node type - no 'process_id' or 'product_id'");
        },

        findNode: function (process_id, args) {
            const procDef = this.processes[process_id];
            if (procDef) {
                console.log("Found for id: " + process_id + " entry: " + JSON.stringify(procDef) + " creating with args: " + JSON.stringify(args));
                return procDef.fun(args);
            }
            throw new errors.BadRequestError('Unknown process id: ' + process_id);
        },
        addProcess: function (proc) {
            const process_id = proc().process_id;
            console.log("Registering: " + process_id);
            this.processes[process_id] = {
                id: process_id,
                fun: proc
            };
            console.log(JSON.stringify(this.processes));
        }
    }

    function node(process_id_val, argsVal) {
        const ret = {};
        if (argsVal) {
            Object.assign(ret, argsVal);
        }
        ret.process_id = process_id_val;
        ret.buildJob = () => {
            throw new Error("Node with missing buildJob implementation: "+(typeof this));
        };
        console.log('built node: ' + process_id_val + ' args: ' + JSON.stringify(argsVal) + ' ret: ' + JSON.stringify(ret));
        return ret;
    }

    function imagery_node(process_id_val, argsVal) {
        const ret = node(process_id_val, argsVal);
        if (ret.imagery) {
            ret.imagery = processRegistry.buildNode(ret.imagery);
        } else if (argsVal) {
            throw new Error("Missing 'imagery' argument: " + JSON.stringify(argsVal));
        }
        ret.buildImageryJob = function() {
            return new job_data(ret.imagery.buildJob());
        }
        return ret;
    }

    function node_product(product_id) {
        const ret = node("product");
        ret.product_id = product_id;
        ret.buildJob = () => new job_data({source : ret.product_id});
        return ret;
    }

    function node_filter_bbox(args) {
        const ret = imagery_node("filter_bbox", args);
        ret.buildJob = function () {
            const job = ret.buildImageryJob();
            const boxArr = [args.left, args.bottom, args.right, args.top];
            if (job.geometry) {
                job.geometry = turf.bboxClip(job.geometry, boxArr)
            } else {
                job.geometry = turf.bboxPolygon(boxArr);
            }
            return job;
        };
        return ret;
    }
    processRegistry.addProcess(node_filter_bbox);


    function node_filter_daterange(args) {
        const ret = imagery_node("filter_daterange", args);

        ret.buildJob = function () {
            const job = ret.buildImageryJob();
            job.filterScript = job.filterScript + "  scenes = scenes.filter(dateRangeFilter(Date.parse('" + ret.from + "'),Date.parse('" + ret.to + "')));\n";
            return job;
        }

        return ret;
    }
    processRegistry.addProcess(node_filter_daterange);

    function node_NDI(args) {
        const ret = imagery_node("NDI", args);

        ret.buildJob = function () {
            const job = ret.buildImageryJob();
            job.numOutBands = 1;
            job.addRequiredBand(ret.band1);
            job.addRequiredBand(ret.band2);
            job.evalScript = job.evalScript + "  samples = samples.map(s => NDI(s." + ret.band1 + ", s." + ret.band2 + "));\n";
            return job;
        }

        return ret;
    }
    processRegistry.addProcess(node_NDI);

    function node_min_time(args) {
        const ret = imagery_node("min_time", args);

        ret.buildJob = function () {
            const job = ret.buildImageryJob();
            job.evalScript = job.evalScript + "  samples = [findMin(samples)];\n";
            return job;
        }
        return ret;
    }
    processRegistry.addProcess(node_min_time);

    class job_data {
        constructor(other_job) {
            this.source = null;
            this.inBands = [];
            this.numOutBands = 0;
            this.filterScript = "";
            this.evalScript = "";
            this.geometry = null;

            if (other_job) {
                Object.assign(this, other_job);
            }
        }

        addRequiredBand(bandId) {
            if (!this.inBands.includes(bandId)) {
                this.inBands.push(bandId);
            }
        }
        
        generateScript() {
            let scr = 'const findMinIndex = arr => {\n' +
                '  let min = Infinity;\n' +
                '  let minIdx = -1;\n' +
                '  for (var i = 0; i < arr.length; i++) {\n' +
                '    let cur = arr[i];\n' +
                '    if (cur < min) {\n' +
                '      min = cur;\n' +
                '      minIdx = i;\n' +
                '    }\n' +
                '  }\n' +
                '  return minIdx;\n' +
                '};\n'
            scr = scr + 'const findMin = arr=> arr[findMinIndex(arr)];\n';
    
            scr = scr + 'const NDI = (a, b) => (a - b) / (a + b);\n';
    
            scr = scr + 'const dateRangeFilter = (from, to) => {\n';
            scr = scr + '    return (scene => from < scene.date.getTime() && scene.date.getTime() < to);\n';
            scr = scr + '};\n';
    
            scr = scr + 'function setup(dss) {\n';
            scr = scr + '  setInputComponents([' + this.inBands.map(b => 'dss.' + b).join(',') + ']);\n';
            scr = scr + '  setOutputComponentCount(' + this.numOutBands + ');\n';
            scr = scr + '}\n\n';
    
            scr = scr + 'function filterScenes(scenes, inputMetadata) {\n';
            scr = scr + this.filterScript;
            scr = scr + '  return scenes;\n';
            scr = scr + '}\n\n';
    
            scr = scr + 'function evaluatePixel(samples, scenes) {\n';
            scr = scr + this.evalScript + '\n';
            scr = scr + '  return samples;\n';
            scr = scr + '}\n';
    
            return scr;
        }
    }
    module.job_data = job_data;

    module.job_post = function (req, res, next) {
        try {
            console.log(typeof req.body);
            const jobdesc = req.body;
            console.log("Job: " + JSON.stringify(jobdesc));
            console.log("Processes: " + JSON.stringify(processRegistry));
            const rootNode = processRegistry.buildNode(jobdesc["process_graph"]);
            console.log("Root Node: " + JSON.stringify(rootNode));

            const job = rootNode.buildJob();
            console.log("Job: " + JSON.stringify(job));
            console.log("\n Script:\n" + job.generateScript());

            const uuid = //require('node-uuid').v1();
            '8b055750-da63-11e7-a7b4-717018423482';

            server_storage.set(module.createJobCacheKey(uuid), job);

            res.send({"job_id": uuid});
            return next();
        } catch (e) {
            if (e instanceof errors.HttpError) {
                return next(e);
            }
            throw e;
        }
    };

    return module;
}
