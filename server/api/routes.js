module.exports = function(server) {
  const data = require('./data');
  const processes = require('./processes');
  const jobs = require('./jobs');
  const ogc = require('./ogc');

  server.get('/capabilities',     data.capabilities_get);
  server.get('/data/:product_id', data.data_byId_get);

  server.get('/processes/:process_id', processes.process_byId_get)

  server.post('/jobs', jobs.job_post);

  server.get('/download/:job_id/wcs', ogc.wcs_get);

  return server;
};
