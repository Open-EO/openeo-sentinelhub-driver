module.exports = function(server) {
  const data = require('./data');
  const processes = require('./processes');
  const jobs = require('./jobs');
  const ogc = require('./ogc');
  const users = require('./users');

  server.get('/capabilities', data.capabilities_get);
  
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

  // This is a proprietary extension and is not API compliant
  server.get('/wcs/:job_id', ogc.wcs_get);

  return server;
};
