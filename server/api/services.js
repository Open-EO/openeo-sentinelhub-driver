const { createJobCacheKey, createServiceCacheKey, getWmsUrl } = require('./util')

function services_post (req, res, next) {
  try {
    serviceInput = req.body;

    if (typeof serviceInput.job_id === 'undefined') {
      throw "No job_id specified.";
    }
    if (typeof serviceInput.service_type !== 'string' && serviceInput.service_type === 'wms') {
      throw "Only service_type 'wms' is supported.";
    }

    var job = req.storage.get(createJobCacheKey(serviceInput.job_id));
    if (!job) {
      throw "No job found with the specified id."
    }

    const uuid = require('node-uuid').v1()
    req.storage.set(createServiceCacheKey(uuid), serviceInput)

    console.log("created service (" + serviceInput.service_type + ") with id: " + uuid);

    res.json({
      service_id: uuid,
      service_url: getWmsUrl(req, uuid),
      service_type: serviceInput.service_type,
      service_args: {
        name: 'WMS',
        request: 'GetCoverage',
        service: 'WMS',
        coverage: 'CUSTOM',
        format: 'image/jpeg',
        tileSize: 256,
        minZoom: 8
      },
      job_id: serviceInput.job_id
    })
  } catch (e) {
    console.log(e)
    res.send(500)
  }
  return next()
}

function services_delete(req, res, next) {
  req.storage.expire(createServiceCacheKey(req.params.service_id));
  console.log("deleted service with id: " + req.params.service_id);
  res.send(200);
  return next();
}

module.exports = {
  services_post,
  services_delete
}
