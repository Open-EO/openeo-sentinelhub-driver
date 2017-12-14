const restify = require('restify');


const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const NodeCache = require('node-cache');
const cache = new NodeCache();

server.use((req, res, next) => {
  req.storage = cache;
  next();
})

const routes = require('./api/routes');

const port = process.env.PORT || 8080
routes(server).listen(port, () =>
  console.log('%s listening at %s', server.name, server.url)
);
