const request = require('request');
const wkt = require('wellknown');
const errors = require('restify-errors');

const { createJobCacheKey } = require('./util');

const debug = true;

function wcs_get(req, res, next) {
  const job_id = req.params.job_id;
  const server_storage = req.storage;

  const cached_job =server_storage.get(createJobCacheKey(job_id));
  if (!cached_job) {
    if (!debug) {
      return next(new errors.NotFoundError(`job: ${job_id}`));
    }
  }

  const scr = cached_job ? cached_job.generateScript() : "return [0.5 + 0.5 * (B08 - B04)/(B08 + B04)]";
  const geom = cached_job ? cached_job.geometry : '';

  const job =  {
    script: new Buffer(scr).toString('base64'),
    geometry: geom,
  };

  const sUrl = 'http://services.sentinel-hub.com/ogc/wcs/ef60cfb1-53db-4766-9069-c5369c3161e6';
  const sQueryParams = req.query;
  sQueryParams.coverage = 'CUSTOM';
  sQueryParams.GEOMETRY = job.geometry ? wkt.stringify(job.geometry) : '';
  sQueryParams.evalscript = job.script;
  
  console.log(sUrl);
  console.log(JSON.stringify(sQueryParams));

  res.header('job_id', job_id);
  res.header('job_script', job.script);
  request({ url: sUrl, qs: sQueryParams }).pipe(res);

  return next();
}

module.exports = {
  wcs_get
}
