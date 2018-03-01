module.exports = function(server) {
  const capabilities = require('./capabilities');
  const data = require('./data');
  const processes = require('./processes');
  const jobs = require('./jobs');
  const services = require('./services');
  const ogc = require('./ogc');
  const users = require('./users');

  server.get('/capabilities', capabilities.capabilities_get);
  server.get('/capabilities/services', capabilities.services_get);
  
  server.get('/data', data.data_get);
  server.get('/data/:product_id', data.data_byId_get);

  server.get('/processes', processes.process_get);
  server.get('/processes/:process_id', processes.process_byId_get);

  server.post('/jobs', jobs.job_post);
  
  server.get('/users/:user_id/files', users.user_files);
  server.get('/users/:user_id/process_graphs', users.user_process_graphs);
  server.get('/users/:user_id/services', users.user_services);
  server.get('/users/:user_id/jobs', users.user_jobs);
  server.get('/users/:user_id/credits', users.user_credits);

  server.post('/services', services.services_post);

  // This is a proprietary extension and is not API compliant
  server.get('/wms/:service_id', ogc.wms_get);

  return server;
};
