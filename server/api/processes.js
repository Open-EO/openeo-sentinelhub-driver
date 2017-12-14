function getProcess(process_id) {
  return {
    'process_id': process_id,
    'description': 'This _is_ a process'
  }
}


function process_byId_get(req, res, next) {
  const p = getProcess(req.params.process_id);

  res.json(p);
  return next();
}


module.exports = {
  process_byId_get
}
