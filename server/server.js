const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')

const server = restify.createServer()
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

const cors = corsMiddleware({
  preflightMaxAge: 5, // Optional
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)

const cache = require('node-file-cache').create()
console.log(JSON.stringify(cache.get('a')))

server.use((req, res, next) => {
  req.storage = cache
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
