const restify = require('restify');


const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const NodeCache = require( "node-cache" );
server.storage = new NodeCache();

const routes = require('./api/routes')(server); //importing route

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});