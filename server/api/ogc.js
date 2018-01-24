const request = require('request');
const wkt = require('wellknown');
const errors = require('restify-errors');
const fs = require('fs');
const path = require('path');
const jobDir = path.resolve(__dirname, '../jobs');

const { createJobCacheKey } = require('./util');

const debug = false;

function wcs_get(req, res, next) {
  const job_id = req.params.job_id;
  const server_storage = req.storage;
  const cached_job = fs.readFile(jobDir + `/${job_id}.json`, (data, err) => {
    return new errors.NotFoundError(`job: ${job_id}`);
    if (err) {
    }
    console.log(data);
    callback(null, data);
  });

  const job = cached_job;
  
  const sUrl = 'http://services.sentinel-hub.com/ogc/wcs/ef60cfb1-53db-4766-9069-c5369c3161e6';
  const sQueryParams = req.query;
  sQueryParams.coverage = 'CUSTOM';
  sQueryParams.temporal = 'true';
  sQueryParams.GEOMETRY = job.geometry ? wkt.stringify(job.geometry) : '';
  sQueryParams.evalscript = new Buffer(job.generateScript()).toString('base64');
  if (job.maxTime) {
    if (job.minTime) {
      sQueryParams.time = job.minTime + '/' + job.maxTime;
    } else {
      sQueryParams.time = job.maxTime;
    }
  }
  
  console.log(sUrl);
  console.log(JSON.stringify(sQueryParams));

  res.header('job_id', job_id);
  res.header('job_script', job.script);
  request({ url: sUrl, qs: sQueryParams }).pipe(res);

  return next();
}

module.exports = {
  wcs_get
};
