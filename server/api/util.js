const JobData = require('./JobData')

function createJobCacheKey(uuid) {
  return `job.${uuid}`
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

  if (ret.collections) {
    ret.collections = ret.collections.map((coll) => processRegistry.buildNode(coll));
  } else if (argsVal) {
    throw new Error(`Missing 'collections' argument: ${JSON.stringify(argsVal)}`);
  }

  ret.buildCollectionsJob = () => {
    if (ret.collections.length != 1) {
      console.log("ERROR: "+JSON.stringify(ret));
      throw new Error('Collections with more than 1 element are not supported (was '+ret+')');
    }
    return new JobData(ret.collections[0].buildJob());
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
  node_product,
  collections_node
}