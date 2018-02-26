const errors = require('restify-errors');
const { node_product } = require('./util')

class ProcessRegistry {
  constructor() {
    this.processes = {}
  }

  buildNode(json) {
    const process_id = json['process_id'];
    if (process_id) {
      return this.findNode(process_id, json['args']);
    }

    const product_id = json['product_id'];
    if (product_id) {
      return node_product(product_id);
    }

    throw new errors.BadRequestError('Unknown node type - no "process_id" or "product_id"; JSON was '+JSON.stringify(json));
  }

  findNode(process_id, args) {
    const procDef = this.processes[process_id];
    if (procDef) {
      console.log(`Found for id: ${process_id} entry: ${JSON.stringify(procDef)} creating with args: ${JSON.stringify(args)}`);
      return procDef.fun(args);
    }

    throw new errors.BadRequestError('Unknown process id: ' + process_id);
  }

  addProcess(proc) {
    const process_id = proc().process_id;
    console.log(`Registering: ${process_id}`);
    this.processes[process_id] = { id: process_id, fun: proc };
    console.log(JSON.stringify(this.processes));
  }
}

module.exports = ProcessRegistry