const request = require('request')
const wkt = require('wellknown')
const errors = require('restify-errors')
const JobData = require('./JobData')

const { createJobCacheKey } = require('./util')

function wcs_get (req, res, next) {
  const jobId = req.params.job_id
  const job = new JobData(req.storage.get(createJobCacheKey(jobId)))

  const sUrl = 'http://services.sentinel-hub.com/ogc/wcs/ef60cfb1-53db-4766-9069-c5369c3161e6'
  const sQueryParams = req.query
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

  console.log(sUrl)
  console.log(JSON.stringify(sQueryParams))

  res.header('job_id', jobId)
  res.header('job_script', job.script)
  request({ url: sUrl, qs: sQueryParams }).pipe(res)

  next()
}

module.exports = {
  wcs_get
}
