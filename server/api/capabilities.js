function capabilities_get() {
  res.json([
	'/capabilities/services',
	'/data',
	'/data/{product_id}',
	'/processes',
	'/processes/{process_id}',
	'/jobs',
	'/services',
	'/users/{user_id}/jobs',
	'/users/{user_id}/services',
	'/users/{user_id}/files',
	'/users/{user_id}/process_graphs',
	'/users/{user_id}/credits',
	'/users/{user_id}/jobs',
	'/wms/{service_id}'
  ]);
  return next();
}

function services_get() {
  res.json([
	'wms'
  ]);
  return next();
}


module.exports = {
  capabilities_get,
  services_get
};

