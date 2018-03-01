const JobData = require('./JobData')

function createJobCacheKey(uuid) {
  return `job.${uuid}`
}

function createServiceCacheKey(uuid) {
  return `service.${uuid}`
}

function getWmsUrl(req, service_id) {
	var baseUrl = req.serverUrl.replace('[::]', '127.0.0.1');
	return baseUrl + '/wms/' + service_id;
}

function node(process_id_val, argsVal) {
  const ret = {};

  if (argsVal) {
    Object.assign(ret, argsVal);
  }

  ret.process_id = process_id_val;
  ret.buildJob = () => {
    throw new Error(`Node with missing buildJob implementation: ${(typeof this)}`);
  };

  console.log(`built node: ${process_id_val} args: ${JSON.stringify(argsVal)} ret: ${JSON.stringify(ret)}`);

  return ret;
}

function collections_node(processRegistry, process_id_val, argsVal) {
  const ret = node(process_id_val, argsVal);

  if (typeof ret.imagery === 'array') {
    ret.imagery = ret.imagery.map((coll) => processRegistry.buildNode(coll));
  } else if (ret.imagery !== null && typeof ret.imagery === 'object') {
    ret.imagery = [ processRegistry.buildNode(ret.imagery) ];
  } else if (argsVal) {
    throw new Error(`Missing 'imagery' argument: ${JSON.stringify(argsVal)}`);
  }

  ret.buildCollectionsJob = () => {
    if (ret.imagery.length != 1) {
      console.log("ERROR: "+JSON.stringify(ret));
      throw new Error('Image collections with more than 1 element are not supported (was '+ret+')');
    }
    return new JobData(ret.imagery[0].buildJob());
  };
  return ret;
}

function node_product(product_id) {
  const ret = node('product');
  ret.product_id = product_id;
  ret.buildJob = () => new JobData({ 'source' : ret.product_id });

  return ret;
}

module.exports = {
  createJobCacheKey,
  createServiceCacheKey,
  node_product,
  collections_node,
  getWmsUrl
}