const request = require('request');
const wkt = require('wellknown');
const errors = require('restify-errors');

const { createJobCacheKey } = require('./util');

function wcs_get(req, res, next) {
  const job_id = req.params.job_id;
  const server_storage = req.storage;

  const cached_job = server_storage.get(createJobCacheKey(job_id));
  if (!cached_job) {
    return next(new errors.NotFoundError(`job: ${job_id}`));
  }

  const job = {
    script: new Buffer(cached_job.generateScript()).toString('base64'),
    geometry: cached_job.geometry,
  }

  const sUrl = 'http://services.sentinel-hub.com/ogc/wms/ef60cfb1-53db-4766-9069-c5369c3161e6';
  const sQueryParams = {
    'service':    'WMS',
    'request':    'GetMap',
    'version':    '1.1.1',
    'layers':     'CUSTOM',
    'format':     'image/jpeg',
    'height':     '512',
    'width':      '512',
    'srs':        'EPSG:4326',
    'bbox':       '15,47,17,49',
    'TEMPORAL':   'true',
    'time':       '2015-01-01/2017-01-31',
    'evalsource': 'S2',
    'PREVIEW':    '3',
    'GEOMETRY':   job.geometry ? wkt.stringify(job.geometry) : '',
    'evalscript': job.script
  };

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
