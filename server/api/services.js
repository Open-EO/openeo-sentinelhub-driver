const { createJobCacheKey, createServiceCacheKey } = require('./util')

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
		throw "No job found with the specified id.";
	}

    const uuid = require('node-uuid').v1()
    req.storage.set(createServiceCacheKey(uuid), serviceInput)
	
	console.log("created service with id: " + uuid);
	
	var baseUrl = req.serverUrl.replace('[::]', '127.0.0.1');
	
    res.json({
      service_id: uuid,
      service_url: baseUrl + '/wms/' + uuid,
	  service_type: serviceInput.service_type,
      service_args: {},
      job_id: serviceInput.job_id
    })
  } catch (e) {
    console.log(e)
    res.send(500)
  }
  return next()
}

module.exports = {
  services_post
}
