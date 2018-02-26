const errors = require('restify-errors')
const turf = {
  bboxPolygon: require('@turf/bbox-polygon'),
  bboxClip: require('@turf/bbox-clip')
}
const ProcessRegistry = require('./ProcessRegistry')
const { createJobCacheKey, collections_node } = require('./util')

function node_filter_bbox (args) {
  const ret = collections_node(processRegistry, 'filter_bbox', args)
  ret.buildJob = () => {
    const job = ret.buildCollectionsJob()
    if (args.srs != 'EPSG:4326') {
      throw new Error('Only 4326 BBOX CRS is supported')
    }
    const boxArr = args.bbox
    if (job.geometry) {
      job.geometry = turf.bboxClip(job.geometry, boxArr)
    } else {
      job.geometry = turf.bboxPolygon(boxArr)
    }
    return job
  }

  return ret
}

function node_filter_daterange (args) {
  const ret = collections_node(processRegistry, 'filter_daterange', args)

  ret.buildJob = () => {
    const job = ret.buildCollectionsJob()
    job.filterScript.push(
      `scenes = scenes.filter(dateRangeFilter(Date.parse('${
      ret.from
      }'),Date.parse('${ret.to}')));`
    )
    job.minTime = ret.from
    job.maxTime = ret.to
    return job
  }

  return ret
}

function normalizeBandId (b) {
  var bS = b.toString()
  if (bS.length < 2) {
    return 'B0' + bS
  } else if (bS.length < 3) {
    return 'B' + bS
  } else {
    return bS
  }
}

function node_NDI (args) {
  const ret = collections_node(processRegistry, 'NDVI', args)
  ret.buildJob = () => {
    const b1 = normalizeBandId(ret.band1)
    const b2 = normalizeBandId(ret.band2)

    const job = ret.buildCollectionsJob()
    job.numOutBands = 1
    job.addRequiredBand(b1)
    job.addRequiredBand(b2)
    job.evalScript.push(`samples = samples.map(s => NDI(s.${b1}, s.${b2}));`)
    return job
  }

  return ret
}

function node_min_time (args) {
  const ret = collections_node(processRegistry, 'min_time', args)

  ret.buildJob = function () {
    const job = ret.buildCollectionsJob()
    job.evalScript.push('samples = [findMin(samples)];')
    return job
  }
  return ret
}

function node_max_time (args) {
  const ret = collections_node(processRegistry, 'max_time', args)

  ret.buildJob = function () {
    const job = ret.buildCollectionsJob()
    job.evalScript.push('samples = [findMax(samples)];')
    return job
  }
  return ret
}

const processRegistry = new ProcessRegistry()
processRegistry.addProcess(node_filter_bbox)
processRegistry.addProcess(node_filter_daterange)
processRegistry.addProcess(node_NDI)
processRegistry.addProcess(node_min_time)
processRegistry.addProcess(node_max_time)

function doJob (serverStorage, jobdesc) {
  const rootNode = processRegistry.buildNode(jobdesc.process_graph)
  const job = rootNode.buildJob()

  console.log(`Job: ${JSON.stringify(job)}`)
  console.log(`\n Script:\n${job.generateScript()}`)

  const uuid = require('node-uuid').v1()
  serverStorage.set(createJobCacheKey(uuid), job)

  const now = new Date();
  
  return {
    job_id: uuid,
    status: 'submitted',
    submitted: now.toISOString(),
    updated: now.toISOString(),
    user_id: null,
    consumed_credits: 0
  }
}

function job_post (req, res, next) {
  try {
    const response = doJob(req.storage, req.body)
    res.json(response)
  } catch (e) {
    console.log(e)
    res.send(500)
  }
  return next()
}

module.exports = {
  job_post
}
