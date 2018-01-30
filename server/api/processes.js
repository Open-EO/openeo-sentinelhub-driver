function getProcess(process_id, args) {
  var data = {
    process_id: process_id,
    description: 'This _is_ a process'
  };
  if (args) {
	  data.args = args;
  }
  return data;
}


function process_get(req, res, next) {
  const p = [
	getProcess('filter_bbox'),
	getProcess('filter_daterange'),
	getProcess('NDI'),
	getProcess('min_time'),
	getProcess('max_time')
  ];

  res.json(p);
  return next();
}


function process_byId_get(req, res, next) {
  const p = getProcess(req.params.process_id, {});

  res.json(p);
  return next();
}


module.exports = {
  process_byId_get,
  process_get
}
