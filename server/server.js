const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')

const server = restify.createServer()
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

const cors = corsMiddleware({
  preflightMaxAge: 5, // Optional
  origins: ['*']
})

server.pre(cors.preflight)
server.use(cors.actual)

var cache = require('node-file-cache').create()
cache.getAll = function() {
  var data = this.db.get('index').value()
  return data.filter(elem => {
    if (elem.life < this._createTimestamp()) {
       this.expire(elem.key);
	   return false;
    }
	return true;
  });
}

console.log(JSON.stringify(cache.get('a')))

server.use((req, res, next) => {
  req.storage = cache
  req.serverUrl = server.url
  next()
})

const routes = require('./api/routes')

server.get(
  /\/client\/?.*/,
  restify.plugins.serveStatic({
    directory: '../',
    default: 'index.html'
  })
)

const port = process.env.PORT || 8080
routes(server).listen(port, () =>
  console.log('%s listening at %s', server.name, server.url)
)
