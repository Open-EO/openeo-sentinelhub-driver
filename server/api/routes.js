'use strict';
module.exports = function(server) {
  var module = {};

  const data = require('./data');

  server.get('/capabilities', data.capabilities_get);
  server.get('/data/:product_id', data.data_byId_get);

  const processes = require('./processes');
  server.get('/processes/:process_id', processes.process_byId_get)

  const jobs = require('./jobs')(server.storage);
  server.post('/jobs', jobs.job_post);
  
  const ogc = require('./ogc')(server.storage);
  server.get('/download/:job_id/wcs',ogc.wcs);

  return module;
};