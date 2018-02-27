const errors = require('restify-errors')
const {createJobCacheKey, collections_node} = require('./util')


function user_credits(req, res, next) {
	res.header('content-type', 'text/plain');
	res.send(200, "0");
	return next();
}

function user_jobs(req, res, next) {
	res.json([
		{
			job_id: "748df7caa8c84a7ff6e",
			status: "submitted",
			submitted: "2017-01-01T09:32:12Z",
			updated: "2017-01-01T09:32:12Z",
			user_id: "bd6f9faf93b4",
			consumed_credits: 0
		}, {
			job_id: "123df7caa8c84a7dddd",
			status: "running",
			submitted: "2017-01-01T12:32:12Z",
			updated: "2017-01-01T13:36:18Z",
			user_id: "bd6f9faf93b4",
			consumed_credits: 392
		}
	]);
	return next();
}

function user_services(req, res, next) {
	res.json([
		{
			service_id: "91f3caa3b5281a",
			service_url: "https://openeo.org/wms/91f3caa3b5281a",
			service_type: "wms",
			service_args: {
				version: 1.1
			},
			job_id: "42d5k3nd92mk49dmj294md"
		}
	]);
	return next();
}

function user_files(req, res, next) {
	res.json([
		{
			name: "test.txt",
			size: 182,
			modified: "2015-10-20T17:22:10Z"
		},
		{
			name: "test.tif",
			size: 183142,
			modified: "2017-01-01T09:36:18Z"
		},
		{
			name: "Sentinel2/S2A_MSIL1C_20170819T082011_N0205_R121_T34KGD_20170819T084427.zip",
			size: 4183353142,
			modified: "2018-01-03T10:55:29Z"
		}
	]);
	return next();
}

function user_process_graphs(req, res, next) {
	res.json([
		"57d7e8ff91a1134",
		"12bd7584efa1236"
	]);
	return next();
}


module.exports = {
	user_credits,
	user_jobs,
	user_services,
	user_files,
	user_process_graphs
};
