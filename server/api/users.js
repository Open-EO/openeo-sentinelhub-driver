const { createJobCacheKey, createServiceCacheKey, getWmsUrl } = require('./util')

function user_credits(req, res, next) {
	res.header('content-type', 'text/plain');
	res.send(200, "0");
	return next();
}

function delete_user_jobs(req, res, next) {
	req.storage.expiry(createJobCacheKey(req.params.job_id));
	console.log("deleted job with id: " + req.params.job_id);
	res.send(200);
	return next();
}

function delete_user_services(req, res, next) {
	req.storage.expiry(createServiceCacheKey(req.params.service_id));
	console.log("deleted service with id: " + req.params.service_id);
	res.send(200);
	return next();
}

function user_jobs(req, res, next) {
	var data = req.storage.getAll();
	var result = [];
	for(var i in data) {
		var elem = data[i];
		if (elem.key.indexOf('job.') === -1) {
			continue;
		}
		var timestamp = new Date(elem.life - 60*60*1000);
		result.push({
			job_id: elem.key.substr(4),
			status: "submitted",
			submitted: timestamp.toISOString(),
			updated: timestamp.toISOString(),
			user_id: req.params.user_id,
			consumed_credits: 0
		});
	}
	res.json(result);
	return next();
}

function user_services(req, res, next) {
	var data = req.storage.getAll();
	var result = [];
	for(var i in data) {
		var elem = data[i];
		console.log(elem);
		if (elem.key.indexOf('service.') === -1) {
			continue;
		}
		const serviceId = elem.key.substr(8);
		result.push({
			service_id: serviceId,
			service_url: getWmsUrl(req, serviceId),
			service_type: elem.val.type,
			service_args: elem.val.service_args || {},
			job_id: elem.val.job_id
		});
	}
	res.json(result);
	return next();
}

function user_files(req, res, next) {
	res.json([
		{
			name: "demo.txt",
			size: 182,
			modified: "2015-10-20T17:22:10Z"
		},
		{
			name: "demo.tif",
			size: 183142,
			modified: "2017-01-01T09:36:18Z"
		}
	]);
	return next();
}

function user_process_graphs(req, res, next) {
	res.json([
		"demo"
	]);
	return next();
}


module.exports = {
	user_credits,
	delete_user_jobs,
	delete_user_services,
	user_jobs,
	user_services,
	user_files,
	user_process_graphs
};
