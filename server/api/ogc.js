const request = require('request')
const wkt = require('wellknown')
const errors = require('restify-errors')
const JobData = require('./JobData')

const { createJobCacheKey, createServiceCacheKey } = require('./util')
const { URLSearchParams } = require('url')

function wms_get (req, res, next) {
  if (!req.params.service_id) {
	  console.log("No service_id arg");
	return next(new errors.NotFoundError()) 
  }
  const service = req.storage.get(createServiceCacheKey(req.params.service_id))
  if (!service) {
	  console.log("No service found");
	return next(new errors.NotFoundError())
  }
  const cachedJob = req.storage.get(createJobCacheKey(service.job_id))
  if (!cachedJob) {
	  console.log("No job found");
    return next(new errors.NotFoundError())
  }
  const job = new JobData(cachedJob)

  const sUrl = 'http://services.sentinel-hub.com/ogc/wcs/ef60cfb1-53db-4766-9069-c5369c3161e6'
  const sQueryParams = req.query
  for(var i in service.service_args) {
	  sQueryParams[i] = service.service_args[i];
  }
  sQueryParams.coverage = 'CUSTOM'
  sQueryParams.temporal = 'true'
  sQueryParams.GEOMETRY = job.geometry ? wkt.stringify(job.geometry) : ''
  sQueryParams.evalscript = Buffer.from(job.generateScript()).toString('base64')
  if (job.maxTime) {
    if (job.minTime) {
      sQueryParams.time = job.minTime + '/' + job.maxTime
    } else {
      sQueryParams.time = job.maxTime
    }
  }

  const params = new URLSearchParams(sQueryParams)
  console.log(sUrl + '?' + params.toString())
  request({ url: sUrl, qs: sQueryParams }).pipe(res)

  next()
}

module.exports = {
  wms_get
}
