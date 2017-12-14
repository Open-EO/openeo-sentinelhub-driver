const errors = require('restify-errors');
const turf = {
  bboxPolygon: require('@turf/bbox-polygon'),
  bboxClip: require('@turf/bbox-clip')
};

const ProcessRegistry = require('./ProcessRegistry')
const { createJobCacheKey, imagery_node } = require('./util')


function node_filter_bbox(args) {
  const ret = imagery_node(processRegistry, 'filter_bbox', args);
  ret.buildJob = () => {
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

function node_filter_daterange(args) {
  const ret = imagery_node(processRegistry, 'filter_daterange', args);

  ret.buildJob = () => {
    const job = ret.buildImageryJob();
    job.filterScript.push(`scenes = scenes.filter(dateRangeFilter(Date.parse('${ret.from}'),Date.parse('${ret.to}')));`);
    return job;
  }

  return ret;
}

function node_NDI(args) {
  const ret = imagery_node(processRegistry, 'NDI', args);

  ret.buildJob = () => {
    const job = ret.buildImageryJob();
    job.numOutBands = 1;
    job.addRequiredBand(ret.band1);
    job.addRequiredBand(ret.band2);
    job.evalScript.push(`samples = samples.map(s => NDI(s.${ret.band1}, s.${ret.band2}));`);
    return job;
  }

  return ret;
}

function node_min_time(args) {
  const ret = imagery_node(processRegistry, 'min_time', args);

  ret.buildJob = function () {
    const job = ret.buildImageryJob();
    job.evalScript.push('samples = [findMin(samples)];');
    return job;
  }
  return ret;
}

const processRegistry = new ProcessRegistry();
processRegistry.addProcess(node_filter_bbox);
processRegistry.addProcess(node_filter_daterange);
processRegistry.addProcess(node_NDI);
processRegistry.addProcess(node_min_time);


function doJob(server_storage, jobdesc) {
  console.log(`Job: ${JSON.stringify(jobdesc)}`);
  console.log(`Processes: ${JSON.stringify(processRegistry)}`);
  const rootNode = processRegistry.buildNode(jobdesc['process_graph']);
  console.log(`Root Node: ${JSON.stringify(rootNode)}`);

  const job = rootNode.buildJob();
  console.log(`Job: ${JSON.stringify(job)}`);
  console.log(`\n Script:\n${job.generateScript()}`);

  // const uuid = require('node-uuid').v1();
  const uuid = '8b055750-da63-11e7-a7b4-717018423482';

  server_storage.set(createJobCacheKey(uuid), job);

  return {
    'job_id': uuid
  };
}


function job_post(req, res, next) {
  try {
    console.log(typeof req.body);
    const j = doJob(req.storage, req.body)

    res.json(j);
    return next();
  } catch (e) {
    if (e instanceof errors.HttpError) {
      return next(e);
    }

    throw e;
  }
}

module.exports = {
  job_post
}
