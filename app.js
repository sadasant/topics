// topics
// by Daniel Rodríguez
// MIT Licensed

// Dependencies
const express  = require('express')
    , http     = require('http')
    , OAuth    = require('oauth').OAuth
    , mongoose = require('mongoose')
    , stylus   = require('stylus')
    , nib      = require('nib')
    , secret   = require('./secret')

var app           = {}
  , app_name      = 'topics'
  , port          = process.env.app_port || process.env.PORT || 5000
  , publ          = process.env.app_port || process.env.PORT ? 'production' : 'public' // Only to test minified files locally
  , server        = express()
  , db            = mongoose.createConnection(secret.mongo_url)
  , oa

// Twitter's OAuth
oa = new OAuth(
     'https://api.twitter.com/oauth/request_token'
   , 'https://api.twitter.com/oauth/access_token'
   , secret.twitter.consumer_key
   , secret.twitter.consumer_secret
   , '1.0'
   , secret.twitter.callback + '/connect/twitter/callback'
   , 'HMAC-SHA1'
   )

app.oa       = oa
app.server   = server
app.secret   = secret
app.utils    = require('./app/utils')(secret)
app.Markdown = require('markdown')

// Models
mongoose.model('User' , require('./app/models/user' )(app))
mongoose.model('Topic', require('./app/models/topic')(app))
mongoose.model('Note' , require('./app/models/note' )(app))

// Nib compiler
function nibCompile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
}

// Express configuration
server.configure(function() {
  server.use(express.limit('5kb'))
  server.use(express.logger('dev'))
  server.use(express.favicon(__dirname + '/topics.ico'))
  server.use(express.cookieParser(secret.session))
  server.use(express.session())
  server.use(express.bodyParser())
  server.use(express.methodOverride())
  server.set('views', __dirname + '/views')
  server.set('view engine', 'jade')
  server.use(require('stylus').middleware({ src: __dirname + '/' + publ, compile: nibCompile }))
  server.use(server.router)
  server.use(express.static(__dirname + '/' + publ))
  server.use(express.errorHandler())
  server.set('port', port)
  server.set('db', {
    main   : db
  , users  : db.model('User')
  , topics : db.model('Topic')
  , notes  : db.model('Note')
  })
})

server.configure('development', function(){
  server.use(express.errorHandler())
})

// Routes
require('./app/routes')(app)

// Starting the server
http.createServer(server).listen(server.get('port'), function(){
  console.log(app_name + ' listening on 127.0.0.1:' + server.get('port'))
})
