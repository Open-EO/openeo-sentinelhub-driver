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

function imagery_node(processRegistry, process_id_val, argsVal) {
  const ret = node(process_id_val, argsVal);

  if (ret.imagery) {
    ret.imagery = processRegistry.buildNode(ret.imagery);
  } else if (argsVal) {
    throw new Error(`Missing 'imagery' argument: ${JSON.stringify(argsVal)}`);
  }

  ret.buildImageryJob = () => new JobData(ret.imagery.buildJob())
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
  imagery_node
}