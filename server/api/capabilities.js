function capabilities_get() {
  res.json([
	'/capabilities/services',
	'/data',
	'/data/{product_id}',
	'/processes',
	'/processes/{process_id}',
	'/jobs',
	'/services',
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

